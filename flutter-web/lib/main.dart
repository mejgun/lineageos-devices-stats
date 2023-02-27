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
    return MaterialApp(
      theme: ThemeData(
        useMaterial3: true,
      ),
      home: const MyHomePage(),
    );
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

  List<Widget> list() {
    return appstate.deviceList.map((e) => DeviceWidget(e, appstate)).toList();
  }

/*
  void sort(int columnIndex, bool ascending) {
    switch (columnIndex) {
      case 3:
        deviceList.sort((a, b) {
          var x = a.oem.toLowerCase();
          var y = b.oem.toLowerCase();
          return ascending ? x.compareTo(y) : y.compareTo(x);
        });
        break;
      case 4:
        deviceList.sort((a, b) {
          var x = a.name.toLowerCase();
          var y = b.name.toLowerCase();
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
*/
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Wrap(children: list()
            //  DataTable(
            //   sortAscending: sortAsc,
            //   sortColumnIndex: sortColumn,
            //   columns: const <DataColumn>[
            //     DataColumn(label: Text('Codename')),
            //     DataColumn(label: Text('Model')),
            //     DataColumn(label: Text('Repos')),
            //   ],
            //   rows: list(),
            // ),
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
