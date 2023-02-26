package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"
)

const (
	buildTargetsURL = "https://raw.githubusercontent.com/LineageOS/hudson/master/lineage-build-targets"
	deviceNamesURL  = "https://github.com/LineageOS/hudson/raw/master/updater/devices.json"
	deviceDepsURL   = "https://raw.githubusercontent.com/LineageOS/hudson/master/updater/device_deps.json"
	commitsAPIURL   = "https://api.github.com/repos/LineageOS/%s/commits?per_page=100"
)

const (
	sleepTime    = time.Second * 5
	apiSleepTime = time.Second * 61
)

type deviceData struct {
	Model  string
	Branch string
	Period string
	Oem    string
	Name   string
	Deps   []string
}

type deviceList map[string]deviceData

type commit struct {
	Commit struct {
		Commiter struct {
			Date  string `json:"date"`
			Name  string `json:"name"`
			Email string `json:"email"`
		} `json:"committer"`
		Author struct {
			Date  string `json:"date"`
			Name  string `json:"name"`
			Email string `json:"email"`
		} `json:"author"`
	} `json:"commit"`
}

type reposInfo map[string][]commit

type commitsInfo struct {
	CommitsCount   uint8  `json:"n"`
	CommitsAvgHour uint64 `json:"t"`
	AuthorCount    int    `json:"a"`
	CommiterCount  int    `json:"c"`
}

type reposCalculated map[string]commitsInfo

func doRequest(url string) ([]byte, int, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Fatalln(err)
	}
	req.Header.Set("User-Agent", "github/mejgun")
	res, err := client.Do(req)
	if err != nil {
		return []byte(""), 0, err
	}
	defer res.Body.Close()
	data, err := ioutil.ReadAll(res.Body)
	if res.StatusCode != 200 {
		return data, res.StatusCode, fmt.Errorf("%s ERROR: %s", url, res.Status)
	}
	return data, 0, err
}

func get(url string) []byte {
	t := sleepTime
	res, code, err := doRequest(url)
	for err != nil {
		log.Println(string(res), err)
		if code == 404 {
			return []byte("{}")
		}
		log.Println("Doubling waiting time")
		t *= 2
		time.Sleep(t)
		res, code, err = doRequest(url)
	}
	return res
}

func main() {
	fmt.Println("Devices")
	resp := getDevices()
	time.Sleep(sleepTime)

	fmt.Println("Build targets")
	resp1 := getBuildTargets(resp)
	time.Sleep(sleepTime)

	resp2 := filterDevicesWithBuilds(resp1)

	fmt.Println("Device deps")
	resp3 := getDeviceDeps(resp2)
	time.Sleep(sleepTime)

	resp3 = filterUnknownDevices(resp3)

	fmt.Println("Saving devices json")
	r, err := json.Marshal(resp3)
	if err != nil {
		log.Fatal(err)
	}
	err = ioutil.WriteFile("../devices.json", r, 0644)
	if err != nil {
		log.Fatal(err)
	}

	time.Sleep(sleepTime)
	fmt.Println("Repos")
	repos := getReposInfo(resp3)
	repos2 := calculateCommits(repos)
	fmt.Println("Saving repos json")
	rj, err := json.Marshal(repos2)
	err = ioutil.WriteFile("../repos.json", rj, 0644)
	if err != nil {
		log.Fatal(err)
	}
}

func calculateCommits(repos reposInfo) reposCalculated {
	r := make(reposCalculated)
	now := time.Now()
	for k, v := range repos {
		var (
			c            commitsInfo
			commitsDates = make([]time.Duration, 0)
			authors      = make(map[string]struct{})
			committers   = make(map[string]struct{})
		)
		for _, s := range v {
			t, err := time.Parse(time.RFC3339, s.Commit.Commiter.Date)
			if err != nil {
				log.Printf("time parser error: %s '%s'", err, t)
				continue
			}
			commitsDates = append(commitsDates, now.Sub(t))
			authors[s.Commit.Author.Email] = struct{}{}
			committers[s.Commit.Commiter.Email] = struct{}{}
		}
		for range authors {
			c.AuthorCount++
		}
		for range committers {
			c.CommiterCount++
		}
		length := len(commitsDates)
		if length > 0 {
			var avg time.Duration
			for _, v := range commitsDates {
				avg += v
			}
			avg = avg / time.Duration(length)
			c.CommitsAvgHour = uint64(avg.Hours())
		}
		c.CommitsCount = uint8(length)
		r[k] = c
	}
	return r
}

func filterUnknownDevices(list deviceList) deviceList {
	newList := make(deviceList)
	for k, v := range list {
		if len(v.Model) > 0 && len(v.Name) > 0 && len(v.Oem) > 0 && len(v.Deps) > 0 {
			newList[k] = v
		}
	}
	return newList
}

func filterDevicesWithBuilds(list deviceList) deviceList {
	newList := make(deviceList)
	for k, v := range list {
		if v.Branch != "" {
			newList[k] = v
		}
	}
	return newList
}

func getReposInfo(list deviceList) reposInfo {
	repos := make(reposInfo)
	for _, v := range list {
		for _, j := range v.Deps {
			repos[j] = make([]commit, 0)
		}
	}
	c := 0
	for r := range repos {
		c++
		fmt.Printf(" * %d/%d %s\n", c, len(repos), r)
		q := get(fmt.Sprintf(commitsAPIURL, r))
		w := make([]commit, 0)
		err := json.Unmarshal(q, &w)
		if err != nil {
			log.Fatal(err)
		}
		for _, v := range w {
			repos[r] = append(repos[r], v)
		}
		time.Sleep(apiSleepTime)
	}
	return repos
}

func getDeviceDeps(list deviceList) deviceList {
	res := get(deviceDepsURL)
	j := make(map[string][]string)
	err := json.Unmarshal(res, &j)
	if err != nil {
		log.Fatal(err)
	}
	for k, v := range j {
		k := strings.ToLower(k)
		d := list[k]
		d.Deps = v
		list[k] = d
	}
	return list
}

func getDevices() deviceList {
	res := get(deviceNamesURL)
	j := make([]deviceData, 0)
	json.Unmarshal(res, &j)
	list := make(deviceList)
	for _, v := range j {
		v.Deps = make([]string, 0)
		list[strings.ToLower(v.Model)] = v
	}
	return list
}

func getBuildTargets(list deviceList) deviceList {
	res := string(get(buildTargetsURL))
	strList := strings.Split(res, "\n")
	filteredList := make([]string, 0)
	for _, s := range strList {
		s := strings.TrimSpace(s)
		if len(s) > 0 && !strings.HasPrefix(s, "#") {
			filteredList = append(filteredList, s)
		}
	}
	for _, s := range filteredList {
		l := strings.Split(strings.ToLower(s), " ")
		// e.g. "a3xelte userdebug lineage-17.1 W"
		if len(l) != 4 {
			continue
		}
		if l[1] != "userdebug" {
			continue
		}
		d := list[l[0]]
		d.Branch = l[2]
		d.Period = l[3]
		list[l[0]] = d
	}
	return list
}
