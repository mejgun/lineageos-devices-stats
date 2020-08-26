package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

const (
	buildTargetsURL = "https://raw.githubusercontent.com/LineageOS/hudson/master/lineage-build-targets"
	deviceNamesURL  = "https://github.com/LineageOS/hudson/raw/master/updater/devices.json"
)

type buildPeriod uint

const (
	never buildPeriod = iota
	nightly
	weekly
	monthly
)

type deviceData struct {
	Model           string
	Branch          string
	Period          buildPeriod
	Oem             string
	Name            string
	LineageRecovery bool `json:"lineage_recovery"`
}

type deviceList map[string]deviceData

func doRequest(url string) ([]byte, error) {
	res, err := http.Get(url)
	if err != nil {
		return []byte(""), err
	}
	if res.StatusCode != 200 {
		return []byte(""), fmt.Errorf("%s ERROR: %s", url, res.Status)
	}
	data, err := ioutil.ReadAll(res.Body)
	res.Body.Close()
	return data, err
}

func get(url string) []byte {
	res, err := doRequest(url)
	if err != nil {
		log.Fatal(err)
	}
	return res
}

func main() {
	resp := getDevices()
	resp2 := getBuildTargets(resp)
	// fmt.Printf("%+v\n", resp2)
	r, _ := json.MarshalIndent(resp2, "", " ")
	fmt.Printf("%s\n", r)
}

func getDevices() deviceList {
	res := get(deviceNamesURL)
	j := make([]deviceData, 0)
	json.Unmarshal(res, &j)
	list := make(deviceList)
	for _, v := range j {
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
		switch l[3] {
		case "n":
			d.Period = nightly
		case "w":
			d.Period = weekly
		case "m":
			d.Period = monthly
		default:
			continue
		}
		list[l[0]] = d
	}
	return list
}
