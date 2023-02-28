import 'dart:math' as math;
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:frontend/renders.dart';
import 'package:http/http.dart' as http;

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
            int avg = el.deps.fold(
              0,
              (prev, el) => prev + (appstate.repos[el]?.commitsAvgDaysAgo ?? 0),
            );
            avg = (avg / el.deps.length).round();
            el.totalDaysAvg = avg;
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
      default:
    }

    setState(() {
      sortColumn = columnIndex;
      sortAsc = ascending;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: DataTable(
          sortAscending: sortAsc,
          sortColumnIndex: sortColumn,
          columns: <DataColumn>[
            DataColumn(
              label: Text('Code'),
              onSort: sort,
            ),
            DataColumn(
                numeric: true,
                label: Text(
                  'Branch',
                ),
                onSort: sort),
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
              label: Text('Repos\n(Days)'),
              onSort: sort,
            ),
            DataColumn(
              numeric: true,
              label: Text('Repos\n(Count)'),
              onSort: sort,
            ),
          ],
          rows: appstate.deviceList.map((e) => DeviceRow(e, appstate)).toList(),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: loadData,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
