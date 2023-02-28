import 'package:url_launcher/url_launcher.dart';
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

import 'package:flutter/material.dart';
import 'package:frontend/data.dart';
import 'package:frontend/logic.dart';

DataRow DeviceRow(Device d, AppState appState) {
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
          Text(d.name, style: TextStyle(fontWeight: FontWeight.bold)),
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
        /*Text(d.deps
        .map((e) => '$e - ${appState.repos[e]?.commitsAvgDaysAgo}')
        .join("\n")),*/
        // ),
      ]);
}

Widget repoSum(Device d, AppState appState) {
  if (d.deps.isEmpty) {
    return Text('no repos');
  }
  return Text(
    d.totalDaysAvg.toString(),
    style: TextStyle(
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
