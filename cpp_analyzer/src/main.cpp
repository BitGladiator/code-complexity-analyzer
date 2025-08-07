#include "analyzer.hpp"
#include <iostream>
#include "json.hpp"

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: ./analyzer <file.cpp>" << std::endl;
        return 1;
    }

    Analyzer analyzer(argv[1]);
    auto result = analyzer.analyze();

    nlohmann::json jsonResult(result);
    std::cout << jsonResult.dump(4) << std::endl;

    return 0;
}
