import 'dart:math';

class AppState {
  List<Device> deviceList = [];
  Map<String, Repo> repos = {};
  bool compactRepos = true;
  int rnd = Random().nextInt(50);
}

class Device {
  final String model;
  final String branch;
  final String period;
  final String oem;
  final String name;
  final List<String> deps;

  const Device({
    required this.model,
    required this.branch,
    required this.period,
    required this.oem,
    required this.name,
    required this.deps,
  });

  factory Device.fromJson(Map<String, dynamic> json) => Device(
        model: json['Model'],
        branch: json['Branch'],
        period: json['Period'],
        oem: json['Oem'],
        name: json['Name'],
        deps: List<String>.from(json['Deps']),
      );
}

class Repo {
  final int commitsCount;
  final int commitsAvgHour;
  final int authorCount;
  final int commiterCount;

  const Repo({
    required this.commitsCount,
    required this.commitsAvgHour,
    required this.authorCount,
    required this.commiterCount,
  });

  factory Repo.fromJson(Map<String, dynamic> json) => Repo(
        commitsCount: json['n'],
        commitsAvgHour: json['t'],
        authorCount: json['a'],
        commiterCount: json['c'],
      );
}
