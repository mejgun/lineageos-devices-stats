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
	nightly buildPeriod = iota
	weekly
	monthly
)

type deviceData struct {
	branch          string
	period          buildPeriod
	oem             string
	name            string
	lineageRecovery bool
}

type buildDeviceList map[string]deviceData

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
	resp := getBuildTargets()
	resp2 := getDeviceNames(resp)
	fmt.Println(resp2)
}

func getDeviceNames(list buildDeviceList) buildDeviceList {
	type deviceInfo struct {
		Model           string `json:"model"`
		Oem             string `json:"oem,omitempty"`
		Name            string `json:"name,omitempty"`
		LineageRecovery bool   `json:"lineage_recovery,omitempty"`
	}
	res := get(deviceNamesURL)
	j := make([]deviceInfo, 0)
	json.Unmarshal(res, &j)
	for _, v := range j {
		d := list[strings.ToLower(v.Model)]
		d.lineageRecovery = v.LineageRecovery
		d.oem = v.Oem
		d.name = v.Name
		list[strings.ToLower(v.Model)] = d
	}
	return list
}

func getBuildTargets() buildDeviceList {
	res := string(get(buildTargetsURL))
	strList := strings.Split(res, "\n")
	filteredList := make([]string, 0)
	list := make(buildDeviceList)
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
		d := deviceData{branch: l[2]}
		switch l[3] {
		case "n":
			d.period = nightly
		case "w":
			d.period = weekly
		case "m":
			d.period = monthly
		default:
			continue
		}
		list[l[0]] = d
	}
	return list
}
