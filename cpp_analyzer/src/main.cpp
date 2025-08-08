#include "analyzer.hpp"
#include <iostream>

#include <vector>
#include <utility>

#include "json.hpp"  

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: ./analyzer <file.cpp>" << std::endl;
        return 1;
    }

    Analyzer analyzer(argv[1]);
    auto summary = analyzer.analyze();
    auto funcDetails = analyzer.analyzeFunctions();

    nlohmann::json jsonResult;
    jsonResult["summary"] = summary;

    for (auto &f : funcDetails) {
        jsonResult["functions_detail"].push_back({
            {"name", std::get<0>(f)},
            {"complexity", std::get<1>(f)},
            {"issues", std::get<2>(f)},
            {"time_complexity", std::get<3>(f)},
            {"space_complexity", std::get<4>(f)}
        });
    }

    std::cout << jsonResult.dump(4) << std::endl;
    return 0;
}
