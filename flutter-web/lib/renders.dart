import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/material.dart';
import 'package:frontend/data.dart';
import 'package:frontend/logic.dart';

DataTable FirstTable(
  AppState appstate,
  bool sortAsc,
  int sortColumn,
  void Function(int, bool)? sort,
) =>
    DataTable(
      dataRowMaxHeight: double.infinity, // new property
      sortAscending: sortAsc,
      sortColumnIndex: sortColumn,
      columns: <DataColumn>[
        DataColumn(
          label: const Text('Code'),
          onSort: sort,
        ),
        DataColumn(
          numeric: true,
          label: const Text('Branch'),
          onSort: sort,
        ),
        DataColumn(
          label: const Text('OEM'),
          onSort: sort,
        ),
        const DataColumn(
          label: Text('Name'),
        ),
        DataColumn(
          tooltip: 'Last 100 commits average date (days ago)',
          numeric: true,
          label: const Text('Days'),
          onSort: sort,
        ),
        DataColumn(
          numeric: true,
          tooltip: "Number of device repositories",
          label: const Text('Count'),
          onSort: sort,
        ),
        DataColumn(
          numeric: true,
          tooltip: 'Last 100 commits average autors count',
          label: const Text('Autr'),
          onSort: sort,
        ),
        DataColumn(
          numeric: true,
          tooltip: 'Last 100 commits average committers count',
          label: const Text('Cmtr'),
          onSort: sort,
        ),
      ],
      // source: MySource(appstate),
      rows: appstate.deviceList
          .where((e) => !appstate.hideBranches.contains(e.branch))
          .where((e) => !appstate.hideOems.contains(e.oem))
          .map((e) => DeviceRowA(e, appstate))
          .toList(),
    );

DataTable SecondTable(
  AppState appstate,
) =>
    DataTable(
        dataRowMaxHeight: double.infinity, // new property
        columns: const <DataColumn>[
          DataColumn(
            label: Text('Device'),
          ),
          DataColumn(
            label: Text('Repo'),
          ),
          DataColumn(
            tooltip: 'Last 100 commits average date (days ago)',
            numeric: true,
            label: Text('Days'),
          ),
          DataColumn(
            numeric: true,
            tooltip: "Repository commits count",
            label: Text('Commits'),
          ),
          DataColumn(
            numeric: true,
            tooltip: 'Last 100 commits average autors count',
            label: Text('Autr'),
          ),
          DataColumn(
            numeric: true,
            tooltip: 'Last 100 commits average committers count',
            label: Text('Cmtr'),
          ),
        ],
        // source: MySource(appstate),
        rows: appstate.deviceList
            .where((e) => !appstate.hideBranches.contains(e.branch))
            .where((e) => !appstate.hideOems.contains(e.oem))
            .fold(<DataRow>[], (prev, e) {
          prev.addAll(e.deps.map(
            (t) => DeviceRowB(e, t, appstate),
          ));
          return prev;
        }).toList());

DataRow DeviceRowB(Device d, String r, AppState appState) {
  return DataRow(
      color: appState.maxDays > 0
          ? MaterialStatePropertyAll(
              gradient((appState.repos[r]!.commitsAvgDaysAgo -
                          appState.minDays) /
                      (appState.maxDays - appState.minDays))
                  .withAlpha(150),
            )
          : null,
      cells: <DataCell>[
        DataCell(
          onTap: () => launchUrl(
              Uri.parse('https://wiki.lineageos.org/devices/${d.model}/')),
          Text('${d.oem} ${d.name}'),
        ),
        DataCell(
            onTap: () =>
                launchUrl(Uri.parse('https://github.com/LineageOS/${r}/')),
            Text(r)),
        DataCell(Text(
          appState.repos[r]!.commitsAvgDaysAgo.toString(),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
          ),
        )),
        DataCell(Text(appState.repos[r]!.commitsCount.toString())),
        DataCell(Text(appState.repos[r]!.authorCount.toString())),
        DataCell(Text(appState.repos[r]!.commiterCount.toString())),
      ]);
}

DataTable ThirdTable(
  AppState appstate,
) =>
    DataTable(
        dataRowMaxHeight: double.infinity, // new property
        columns: const <DataColumn>[
          DataColumn(
            label: Text('Repo'),
          ),
          DataColumn(
            tooltip: 'Last 100 commits average date (days ago)',
            numeric: true,
            label: Text('Days'),
          ),
          DataColumn(
            numeric: true,
            tooltip: "Repository commits count",
            label: Text('Commits'),
          ),
          DataColumn(
            numeric: true,
            tooltip: 'Last 100 commits average autors count',
            label: Text('Autr'),
          ),
          DataColumn(
            numeric: true,
            tooltip: 'Last 100 commits average committers count',
            label: Text('Cmtr'),
          ),
          DataColumn(
            numeric: true,
            label: Text('Count'),
          ),
          DataColumn(
            label: Text('Devices'),
          ),
        ],
        // source: MySource(appstate),
        rows: appstate.repos.entries
            .map((e) => DeviceRowC(
                e.key,
                appstate.deviceList
                    .where((element) => element.deps.contains(e.key))
                    .toList(),
                appstate))
            .toList());

DataRow DeviceRowC(String r, List<Device> d, AppState appState) {
  return DataRow(
      color: appState.maxDays > 0
          ? MaterialStatePropertyAll(
              gradient((appState.repos[r]!.commitsAvgDaysAgo -
                          appState.minDays) /
                      (appState.maxDays - appState.minDays))
                  .withAlpha(150),
            )
          : null,
      cells: <DataCell>[
        DataCell(
            onTap: () =>
                launchUrl(Uri.parse('https://github.com/LineageOS/${r}/')),
            Text(r)),
        DataCell(Text(
          appState.repos[r]!.commitsAvgDaysAgo.toString(),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
          ),
        )),
        DataCell(Text(appState.repos[r]!.commitsCount.toString())),
        DataCell(Text(appState.repos[r]!.authorCount.toString())),
        DataCell(Text(appState.repos[r]!.commiterCount.toString())),
        DataCell(Text(d.length.toString())),
        DataCell(
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: d.map((e) => Text('${e.oem} ${e.name}')).toList(),
          ),
        ),
      ]);
}

/*

// import 'dart:html' as html;

import 'package:flutter/material.dart';
import 'package:frontend/data.dart';
import 'package:frontend/logic.dart';

class DeviceWidget extends StatefulWidget {
  const DeviceWidget(this.device, this.appstate, {super.key});
  final Device device;
  final AppState appstate;

  @override
  State<DeviceWidget> createState() => _DeviceWidgetState();
}

class _DeviceWidgetState extends State<DeviceWidget> {
  late bool _compact;

  @override
  void initState() {
    _compact = widget.appstate.compactRepos;
    super.initState();
  }

  Widget repoSum() {
    if (widget.device.deps.isEmpty) {
      return Text('no repos');
    }
    if (_compact) {
      int avg = widget.device.deps.fold(
        0,
        (previousValue, element) =>
            previousValue +
            (widget.appstate.repos[element]?.commitsAvgHour ?? 0),
      );
      avg = (avg / widget.device.deps.length).round();
      return Text('$avg - ${widget.device.deps.length}');
    }
    return Text(widget.device.deps
        .map((e) => '$e - ${widget.appstate.repos[e]?.commitsAvgHour}')
        .join("\n"));
  }

  @override
  Widget build(BuildContext context) {
    return /*ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 500),
      child: */
        Card(
      color: widget.appstate.getColor(widget.device.oem),
      /*shape: RoundedRectangleBorder(
        side: BorderSide(
          width: 5,
          color: widget.appstate.getColor(widget.device.oem),
        ),
      ),
*/
      // margin: EdgeInsets.all(10),
      child: SizedBox(
        width: 300,
        child: Padding(
          padding: EdgeInsets.all(10),
          child: Column(
            children: [
              Text(
                '${widget.device.oem} ${widget.device.name}',
                softWrap: true,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              FilledButton(
                style: ButtonStyle(
                  backgroundColor: MaterialStatePropertyAll(
                    widget.appstate.getColor(widget.device.oem),
                    // getColors(widget.device.branch
                    //     .replaceFirst("lineage-", "")
                    //     .hashCode),
                  ),
                ),
                onPressed: () => launchUrl(
                  Uri.parse(
                    'https://wiki.lineageos.org/devices/${widget.device.model}/',
                  ),
                ),
                child: Text(
                  '${widget.device.model} (${widget.device.period}) ${widget.device.branch}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ),
              repoSum(),
            ],
            // ),
          ),
        ),
      ),
    );
  }
}

*/

class MySource extends DataTableSource {
  final AppState appstate;

  MySource(this.appstate);

  @override
  DataRow? getRow(int index) =>
      DeviceRowA(appstate.deviceList[index], appstate);

  @override
  bool get isRowCountApproximate => false;

  @override
  int get rowCount => appstate.deviceList.length;

  @override
  int get selectedRowCount => 0;
}

DataRow DeviceRowA(Device d, AppState appState) {
  return DataRow(
      color: appState.totalMaxDays > 0
          ? MaterialStatePropertyAll(
              gradient((d.totalDaysAvg - appState.totalMinDays) /
                      (appState.totalMaxDays - appState.totalMinDays))
                  .withAlpha(150),
            )
          : null,
      cells: <DataCell>[
        DataCell(
          onTap: () => launchUrl(
              Uri.parse('https://download.lineageos.org/${d.model}/')),
          Text(d.model),
        ),
        DataCell(Text(d.branch)),
        DataCell(Text(d.oem)),
        DataCell(
          onTap: () => launchUrl(
              Uri.parse('https://wiki.lineageos.org/devices/${d.model}/')),
          Text(d.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        ),
        // DataCell(
        //   RichText(
        //     text: TextSpan(
        //       children: <TextSpan>[
        //         TextSpan(
        //           text: '${d.name}\n${d.oem}',
        //           style: TextStyle(),
        //         ),
        //         TextSpan(text: ' ${d.model} ${d.period}'),
        //       ],
        //     ),
        //   ),
        // ),
        DataCell(repoSum(d, appState)),
        DataCell(Text(d.deps.length.toString())),
        DataCell(Text(d.totalAuthorsAvg.toString())),
        DataCell(Text(d.totalCommittersAvg.toString())),
        /*Text(d.deps
        .map((e) => '$e - ${appState.repos[e]?.commitsAvgDaysAgo}')
        .join("\n")),*/
        // ),
      ]);
}

Widget repoSum(Device d, AppState appState) {
  if (d.deps.isEmpty) {
    return const Text('no repos');
  }
  return Text(
    d.totalDaysAvg.toString(),
    style: const TextStyle(
      fontWeight: FontWeight.bold,
    ),
  );
  // int avg = d.deps.fold(
  //     0, (prev, el) => prev + (appState.repos[el]?.commitsAvgDaysAgo ?? 0));
  // avg = (avg / d.deps.length).round();
  // return Text('$avg - ${d.deps.length}');
  // return Text(widget.device.deps
  //     .map((e) => '$e - ${widget.appstate.repos[e]?.commitsAvgHour}')
  //     .join("\n"));
}
