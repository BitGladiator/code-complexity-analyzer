#include "analyzer.hpp"
#include <fstream>
#include <sstream>
#include <regex>

Analyzer::Analyzer(const std::string& filename) {
    loadFile(filename);
}

void Analyzer::loadFile(const std::string& filename) {
    std::ifstream file(filename);
    std::stringstream buffer;
    buffer << file.rdbuf();
    code = buffer.str();
}

int Analyzer::countFunctions() {
    std::regex funcRegex(R"(\b[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*\)\s*\{)");
    return std::distance(
        std::sregex_iterator(code.begin(), code.end(), funcRegex),
        std::sregex_iterator()
    );
}

int Analyzer::countLoops() {
    std::regex loopRegex(R"(\b(for|while|do)\b)");
    return std::distance(
        std::sregex_iterator(code.begin(), code.end(), loopRegex),
        std::sregex_iterator()
    );
}

int Analyzer::countConditionals() {
    std::regex condRegex(R"(\b(if|else if|else)\b)");
    return std::distance(
        std::sregex_iterator(code.begin(), code.end(), condRegex),
        std::sregex_iterator()
    );
}

std::map<std::string, int> Analyzer::analyze() {
    return {
        {"functions", countFunctions()},
        {"loops", countLoops()},
        {"conditionals", countConditionals()}
    };
}

