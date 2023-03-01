class AppState {
  List<Device> deviceList = [];
  Map<String, Repo> repos = {};
  bool compactRepos = true;
  int minDays = 0;
  int maxDays = 0;
  int totalMinDays = 0;
  int totalMaxDays = 0;
  List<String> hideBranches = [];
  List<String> hideOems = [];
}

class Device {
  final String model;
  final String branch;
  final String period;
  final String oem;
  final String name;
  final List<String> deps;
  int totalDaysAvg = 0;
  int totalAuthorsAvg = 0;
  int totalCommittersAvg = 0;

  Device({
    required this.model,
    required this.branch,
    required this.period,
    required this.oem,
    required this.name,
    required this.deps,
  });

  factory Device.fromJson(Map<String, dynamic> json) => Device(
        model: json['Model'],
        branch: json['Branch'].replaceFirst("lineage-", ""),
        period: json['Period'],
        oem: json['Oem'],
        name: json['Name'],
        deps: List<String>.from(json['Deps']),
      );
}

class Repo {
  final int commitsCount;
  final int commitsAvgDaysAgo;
  final int authorCount;
  final int commiterCount;

  const Repo({
    required this.commitsCount,
    required this.commitsAvgDaysAgo,
    required this.authorCount,
    required this.commiterCount,
  });

  factory Repo.fromJson(Map<String, dynamic> json) => Repo(
        commitsCount: json['n'],
        commitsAvgDaysAgo: json['t'],
        authorCount: json['a'],
        commiterCount: json['c'],
      );
}
