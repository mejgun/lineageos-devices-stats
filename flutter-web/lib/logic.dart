List<int> getColors(int num) {
  const min = 150;
  int c1 = 0;
  int c2 = 0;
  int c3 = 0;
  while (num > 0) {
    int r = num % 100;
    c1 = c2;
    c2 = c3;
    c3 = r;
    num = (num / 100).round();
  }
  return [c1, c2, c3].map((e) => e + min).toList();
}
