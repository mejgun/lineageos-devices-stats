import 'dart:math' as math;
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:frontend/renders.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

import 'data.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: MyHomePage());
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  AppState appstate = AppState();
  int? sortColumn;
  bool sortAsc = true;
  int currentPageIndex = 0;
  bool _showFilters = false;

  void loadData() {
    http.get(Uri.parse('/devices.json')).then((resp) {
      if (resp.statusCode == 200) {
        setState(() {
          appstate.deviceList = (json.decode(resp.body) as Map<String, dynamic>)
              .map((key, value) => MapEntry(key, Device.fromJson(value)))
              .entries
              .map((e) => e.value)
              .toList();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(resp.reasonPhrase ?? resp.statusCode.toString())));
      }
    }).onError((error, _) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(error.toString())));
    });

    http.get(Uri.parse('/repos.json')).then((resp) {
      if (resp.statusCode == 200) {
        setState(() {
          appstate.repos = (json.decode(resp.body) as Map<String, dynamic>)
              .map((key, value) => MapEntry(key, Repo.fromJson(value)));
          appstate.deviceList = appstate.deviceList.map((el) {
            if (el.deps.isEmpty) return el;
            int avgFunc(int? Function(String s) f) => (el.deps.fold(
                      0,
                      (prev, el) => prev + (f(el) ?? 0),
                    ) /
                    el.deps.length)
                .round();

            el.totalDaysAvg =
                avgFunc((s) => appstate.repos[s]?.commitsAvgDaysAgo);
            el.totalAuthorsAvg = avgFunc((s) => appstate.repos[s]?.authorCount);
            el.totalCommittersAvg =
                avgFunc((s) => appstate.repos[s]?.commiterCount);
            /*
            () {
              int avg = el.deps.fold(
                0,
                (prev, el) =>
                    prev + (appstate.repos[el]?.commitsAvgDaysAgo ?? 0),
              );
              avg = (avg / el.deps.length).round();
              el.totalDaysAvg = avg;
            }();
            () {
              int avg = el.deps.fold(
                0,
                (prev, el) => prev + (appstate.repos[el]?.authorCount ?? 0),
              );
              avg = (avg / el.deps.length).round();
              el.totalAuthorsAvg = avg;
            }();
            () {
              int avg = el.deps.fold(
                0,
                (prev, el) => prev + (appstate.repos[el]?.commiterCount ?? 0),
              );
              avg = (avg / el.deps.length).round();
              el.totalCommittersAvg = avg;
            }();
            */
            return el;
          }).toList();
          appstate.maxDays = appstate.repos.entries
              .map((e) => e.value.commitsAvgDaysAgo)
              .reduce(math.max);
          appstate.minDays = appstate.repos.entries
              .map((e) => e.value.commitsAvgDaysAgo)
              .reduce(math.min);
          appstate.totalMaxDays =
              appstate.deviceList.map((e) => e.totalDaysAvg).reduce(math.max);
          appstate.totalMinDays =
              appstate.deviceList.map((e) => e.totalDaysAvg).reduce(math.min);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(resp.reasonPhrase ?? resp.statusCode.toString())));
      }
    }).onError((error, _) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(error.toString())));
    });
  }

  @override
  void initState() {
    loadData();
    super.initState();
  }

  void sort(int columnIndex, bool ascending) {
    switch (columnIndex) {
      case 0:
        appstate.deviceList.sort((a, b) {
          var x = a.model.toLowerCase();
          var y = b.model.toLowerCase();
          return ascending ? x.compareTo(y) : y.compareTo(x);
        });
        break;
      case 1:
        appstate.deviceList.sort((a, b) {
          var x = a.branch.toLowerCase();
          var y = b.branch.toLowerCase();
          return ascending ? x.compareTo(y) : y.compareTo(x);
        });
        break;
      case 2:
        appstate.deviceList.sort((a, b) {
          var x = (a.oem + a.name).toLowerCase();
          var y = (b.oem + b.name).toLowerCase();
          return ascending ? x.compareTo(y) : y.compareTo(x);
        });
        break;
      case 4:
        appstate.deviceList.sort((a, b) {
          var x = a.totalDaysAvg;
          var y = b.totalDaysAvg;
          return ascending ? x.compareTo(y) : y.compareTo(x);
        });
        break;
      case 5:
        appstate.deviceList.sort((a, b) {
          var x = a.deps.length;
          var y = b.deps.length;
          return ascending ? x.compareTo(y) : y.compareTo(x);
        });
        break;
      case 6:
        appstate.deviceList.sort((a, b) {
          var x = a.totalAuthorsAvg;
          var y = b.totalAuthorsAvg;
          return ascending ? x.compareTo(y) : y.compareTo(x);
        });
        break;
      case 7:
        appstate.deviceList.sort((a, b) {
          var x = a.totalCommittersAvg;
          var y = b.totalCommittersAvg;
          return ascending ? x.compareTo(y) : y.compareTo(x);
        });
        break;
      default:
    }

    setState(() {
      sortColumn = columnIndex;
      sortAsc = ascending;
    });
  }

  Widget filters() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        SizedBox(
          width: 150,
          child: Column(
            children: appstate.deviceList
                .fold(Set<String>(), (prev, el) {
                  prev.add(el.branch);
                  return prev;
                })
                .toList()
                .map((e) => SwitchListTile(
                      title: Text(e),
                      onChanged: (bool value) {
                        setState(() {
                          value
                              ? appstate.hideBranches.remove(e)
                              : appstate.hideBranches.add(e);
                        });
                      },
                      value: !appstate.hideBranches.contains(e),
                    ))
                .toList(),
          ),
        ),
        SizedBox(
          width: 250,
          child: Column(
            children: appstate.deviceList
                .fold(Set<String>(), (prev, el) {
                  prev.add(el.oem);
                  return prev;
                })
                .toList()
                .map((e) => SwitchListTile(
                      title: Text(e),
                      onChanged: (bool value) {
                        setState(() {
                          value
                              ? appstate.hideOems.remove(e)
                              : appstate.hideOems.add(e);
                        });
                      },
                      value: !appstate.hideOems.contains(e),
                    ))
                .toList(),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        children: [
          if (_showFilters) filters(),
          DataTable(
            sortAscending: sortAsc,
            sortColumnIndex: sortColumn,
            columns: <DataColumn>[
              DataColumn(
                label: Text('Code'),
                onSort: sort,
              ),
              DataColumn(
                numeric: true,
                label: Text('Branch'),
                onSort: sort,
              ),
              DataColumn(
                label: Text('OEM'),
                onSort: sort,
              ),
              DataColumn(
                label: Text('Name'),
              ),
              DataColumn(
                tooltip: 'Last 100 commits average date (days ago)',
                numeric: true,
                label: Text('Days'),
                onSort: sort,
              ),
              DataColumn(
                numeric: true,
                tooltip: "Number of device repositories",
                label: Text('Count'),
                onSort: sort,
              ),
              DataColumn(
                numeric: true,
                tooltip: 'Last 100 commits average autors count',
                label: Text('Autr'),
                onSort: sort,
              ),
              DataColumn(
                numeric: true,
                tooltip: 'Last 100 commits average committers count',
                label: Text('Cmtr'),
                onSort: sort,
              ),
            ],
            // source: MySource(appstate),
            rows: appstate.deviceList
                .where((e) => !appstate.hideBranches.contains(e.branch))
                .where((e) => !appstate.hideOems.contains(e.oem))
                .map((e) => DeviceRow(e, appstate))
                .toList(),
          ),
        ],
      ),
      //   Container(
      //     height: 20,
      //   ),
      //   ElevatedButton(
      //     onPressed: () => launchUrl(
      //         Uri.parse('https://github.com/mejgun/lineageos-devices-stats')),
      //     child: Text('GitHub'),
      //   )
      // ],
      // ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          FloatingActionButton(
            onPressed: () {},
            child: Icon(Icons.format_list_bulleted),
          ),
          FloatingActionButton(
            onPressed: () {},
            child: Icon(Icons.list),
          ),
          FloatingActionButton(
            onPressed: () {},
            child: Icon(Icons.view_list),
          ),
          FloatingActionButton(
            onPressed: () {},
            child: Icon(Icons.format_list_numbered_rtl),
          ),
          FloatingActionButton(
            onPressed: () {},
            child: Icon(Icons.format_list_numbered),
          ),
          FloatingActionButton(
            onPressed: () {
              setState(() {
                _showFilters = !_showFilters;
              });
            },
            child:
                Icon(_showFilters ? Icons.filter_list_off : Icons.filter_list),
          ),
        ],
      ),
    );
  }
}
