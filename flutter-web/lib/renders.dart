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
    if (widget.device.deps.length == 0) {
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
    List<int> cols = getColors(widget.device.oem.hashCode);
    return /*ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 500),
      child: */
        Card(
      color: Color.fromRGBO(cols[0], cols[1], cols[2], 1),
      // margin: EdgeInsets.all(10),
      child: Padding(
        padding: EdgeInsets.all(10),
        child: Column(
          children: [
            Text(
              '${widget.device.oem} ${widget.device.name}',
              softWrap: true,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              '${widget.device.model} (${widget.device.period}) ${widget.device.branch}',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            repoSum(),
          ],
          // ),
        ),
      ),
    );
  }
}


    //  DataRow(cells: <DataCell>[
    //   DataCell(Text('${e.model} (${e.period})\n${e.branch}')),
    //   DataCell(Text('${e.oem}\n${e.name}')),
    //   DataCell(Text(
    //       e.deps.map((e) => '$e - ${repos[e]?.commitsAvgHour}').join("\n"))),
    // ]);
    