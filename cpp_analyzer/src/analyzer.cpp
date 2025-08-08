#include "analyzer.hpp"
#include <fstream>
#include <sstream>
#include <regex>
#include <vector>
#include <utility>

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
size_t findMatchingBrace(const std::string& code, size_t startPos) {
    int braceCount = 0;
    for (size_t i = startPos; i < code.size(); i++) {
        if (code[i] == '{') braceCount++;
        else if (code[i] == '}') {
            braceCount--;
            if (braceCount == 0) return i;
        }
    }
    return std::string::npos;
}
// Helper function declarations
int getMaxNestingLevel(const std::string& code);
int getFunctionLength(const std::string& funcCode);
bool isRecursive(const std::string& funcName, const std::string& funcCode);
int countArrays(const std::string& funcCode);
std::string estimateTimeComplexity(int loopDepth, bool recursive);
std::string estimateSpaceComplexity(int arrayCount);

std::vector<std::tuple<std::string, int, std::vector<std::string>, std::string, std::string>> Analyzer::analyzeFunctions() {
    std::vector<std::tuple<std::string, int, std::vector<std::string>, std::string, std::string>> results;
    std::regex funcRegex(R"(([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{)");
    auto begin = std::sregex_iterator(code.begin(), code.end(), funcRegex);
    auto end = std::sregex_iterator();

    for (auto it = begin; it != end; ++it) {
        std::string funcName = (*it)[1];
        size_t pos = it->position();
        
        // Find function end: simple heuristic (find matching closing brace)
        size_t endPos = findMatchingBrace(code, pos + (*it)[0].length());
        if (endPos == std::string::npos) endPos = code.size();

        std::string funcCode = code.substr(pos, endPos - pos + 1);

        // Complexity = number of if/for/while in function
        std::regex complexityRegex(R"(\b(if|for|while)\b)");
        int complexity = std::distance(
            std::sregex_iterator(funcCode.begin(), funcCode.end(), complexityRegex),
            std::sregex_iterator()
        );

        // Suggestions based on nesting and length
        std::vector<std::string> suggestions;
        int maxNesting = getMaxNestingLevel(funcCode);
        if (maxNesting > 3) suggestions.push_back("Deep nesting detected (level " + std::to_string(maxNesting) + ")");

        int length = getFunctionLength(funcCode);
        if (length > 50) suggestions.push_back("Long function (>50 lines), consider splitting");

        // New: Check recursion
        bool recursive = isRecursive(funcName, funcCode);
        if (recursive) suggestions.push_back("Function is recursive");

        // New: Count arrays for space estimation
        int arrays = countArrays(funcCode);

        // New: Estimate time and space complexities
        std::string timeComplexity = estimateTimeComplexity(maxNesting, recursive);
        std::string spaceComplexity = estimateSpaceComplexity(arrays);

        results.push_back(std::make_tuple(funcName, complexity, suggestions, timeComplexity, spaceComplexity));
    }
    return results;
}

// Find matching closing brace for a function starting at startPos (assumes code[startPos] == '{' or after function signature)



int getMaxNestingLevel(const std::string& code) {
    int maxLevel = 0, currentLevel = 0;
    for (char c : code) {
        if (c == '{') currentLevel++;
        else if (c == '}') currentLevel--;
        if (currentLevel > maxLevel) maxLevel = currentLevel;
    }
    return maxLevel;
}

int getFunctionLength(const std::string& funcCode) {
    std::istringstream stream(funcCode);
    int lines = 0;
    std::string line;
    while (std::getline(stream, line)) lines++;
    return lines;
}

bool isRecursive(const std::string& funcName, const std::string& funcCode) {
    // Check if function calls itself (simple substring search)
    std::regex callRegex(funcName + R"(\s*\()");
    return std::regex_search(funcCode, callRegex);
}

int countArrays(const std::string& funcCode) {
    // Count basic array or vector declarations (very naive)
    std::regex arrRegex(R"(\b(int|float|double|char|std::vector<[^>]+>)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*(\[.*\])?)");
    return std::distance(
        std::sregex_iterator(funcCode.begin(), funcCode.end(), arrRegex),
        std::sregex_iterator()
    );
}

std::string estimateTimeComplexity(int loopDepth, bool recursive) {
    if (recursive) return "O(2^n)";  // naive assumption for recursion
    if (loopDepth == 0) return "O(1)";
    if (loopDepth == 1) return "O(n)";
    if (loopDepth == 2) return "O(n^2)";
    return "O(n^" + std::to_string(loopDepth) + ")";
}

std::string estimateSpaceComplexity(int arrayCount) {
    if (arrayCount == 0) return "O(1)";
    return "O(n)";
}
