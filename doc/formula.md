
* We have last 100 commits datetimes for each repo. Bring them to (today-commit date) duration form. To number of hours passed [pic](https://raw.githubusercontent.com/mejgun/lineageos-devices-stats/master/doc/scheme.svg)
* Then calculating the minimum for all values
* Subtract min from all values
* If commits count < 100, then add to result (100-commits count)*(max-min) (just fill missing values with max value)
* Add all the numbers in repo together
* Now we have a number for each repo
* Reduce these numbers to percentage and subtract from 100
(100-(sum/(max-min)/100)
* Final HP bar is just average of device’s repos
