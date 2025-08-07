#include <iostream>
using namespace std;

void hello() {
    for (int i = 0; i < 5; i++) {
        if (i % 2 == 0)
            cout << i << endl;
    }
}

int main() {
    hello();
    return 0;
}
