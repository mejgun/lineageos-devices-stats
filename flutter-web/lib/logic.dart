import 'package:flutter/material.dart';

Color gradient(double percent) {
  const color1 = Colors.green;
  const color2 = Colors.red;
  double r = color1.red + percent * (color2.red - color1.red);
  double g = color1.green + percent * (color2.green - color1.green);
  double b = color1.blue + percent * (color2.blue - color1.blue);
  return Color.fromARGB(255, r.round(), g.round(), b.round());
}

/*
Color getColors(int num) {
  const min = 50;
  int c1 = 0, c2 = 0, c3 = 0;
  int c4 = 0, c5 = 0, c6 = 0;
  while (num > 100) {
    int r = num % 100;
    c6 = c5;
    c5 = c4;
    c4 = c3;
    c3 = c2;
    c2 = c1;
    c1 = r;
    num = (num / 100).round();
  }
  var c = [
    Colors.amber,
    Colors.blue,
    Colors.blueGrey,
    Colors.brown,
    Colors.cyan,
    Colors.deepOrange,
    Colors.deepPurple,
    Colors.green,
    Colors.grey,
    Colors.indigo,
    Colors.lightGreen,
    Colors.lightBlue,
    Colors.lime,
    Colors.red,
    Colors.teal,
    Colors.orange,
    Colors.pink,
    Colors.purple,
    Colors.yellow,
  ];
  // return [c1, c3, c5].map((e) => e + min).toList();
  // return Color.fromRGBO(c1 + min, c3 + min, c5 + min, 1);
  // return Color.fromRGBO(c1 + min, c3 + min, c5 + min, 1);
  // var q = Color.fromRGBO(c1 + c2, c3 + c4, c5 + c6, 1);
  var q = Color.fromRGBO(c1 + c2 + min, c3 + c4 + min, c5 + c6 + min, 1);
  double dif(Color c1, Color c2) {
    return sqrt(
      (c2.red - c1.red) * (c2.red - c1.red) +
          (c2.green - c1.green) * (c2.green - c1.green) +
          (c2.blue - c1.blue) * (c2.blue - c1.blue),
    );
  }

  var d = dif(c[0], q);
  var t = q;
  for (var e in c) {
    double d2 = dif(e, q);
    if (d2 < d) {
      d = d2;
      t = e;
    }
  }
  q = t;
  return q;
}
*/