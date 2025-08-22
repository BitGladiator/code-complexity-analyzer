#include "analyzer.hpp"
#include <fstream> //used for file handling
#include <sstream>  // string operations library
#include <regex> //for regular expressions
#include <vector> 
#include <utility>  
#include <algorithm> 

// Constructor: initializes analyzer with file content
Analyzer::Analyzer(const std::string& filename) {
    loadFile(filename);  
}

// Load and read entire file into memory
void Analyzer::loadFile(const std::string& filename) {
    std::ifstream file(filename);
    std::stringstream buffer;
    buffer << file.rdbuf();
    code = buffer.str();
}

// Count function declarations using regex pattern matching
int Analyzer::countFunctions() {
    std::regex funcRegex(R"(\b[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*\)\s*\{)");
    return std::distance(
        std::sregex_iterator(code.begin(), code.end(), funcRegex),
        std::sregex_iterator()
    );
}

// Count loop constructs (for, while, do-while)
int Analyzer::countLoops() {
    std::regex loopRegex(R"(\b(for|while|do)\b)");
    return std::distance(
        std::sregex_iterator(code.begin(), code.end(), loopRegex),
        std::sregex_iterator()
    );
}

// Count conditional statements (if, else if, else)
int Analyzer::countConditionals() {
    std::regex condRegex(R"(\b(if|else if|else)\b)");
    return std::distance(
        std::sregex_iterator(code.begin(), code.end(), condRegex),
        std::sregex_iterator()
    );
}

// Return basic code analysis metrics
std::map<std::string, int> Analyzer::analyze() { // Return a map of metrics
    return {
        {"functions", countFunctions()},
        {"loops", countLoops()},
        {"conditionals", countConditionals()}
    };
}

// Find matching closing brace for a given opening brace position
size_t findMatchingBrace(const std::string& code, size_t startPos) {
    int braceCount = 0;
    for (size_t i = startPos; i < code.size(); i++) {
        if (code[i] == '{') braceCount++;
        else if (code[i] == '}') {
            braceCount--;
            if (braceCount == 0) return i; // Found matching brace
        }
    }
    return std::string::npos; // No matching brace found
}

// Helper function declarations
int getMaxNestingLevel(const std::string& code);
int getFunctionLength(const std::string& funcCode);
bool isRecursive(const std::string& funcName, const std::string& funcCode);
int countArrays(const std::string& funcCode);
int getMaxLoopDepth(const std::string& funcCode); // New function for proper loop depth
std::string estimateTimeComplexity(int loopDepth, bool recursive, int totalLoops);
std::string estimateSpaceComplexity(int arrayCount);

// Detailed function analysis with complexity metrics and suggestions
std::vector<std::tuple<std::string, int, std::vector<std::string>, std::string, std::string>> Analyzer::analyzeFunctions() {
    std::vector<std::tuple<std::string, int, std::vector<std::string>, std::string, std::string>> results;
    std::regex funcRegex(R"(([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{)");
    auto begin = std::sregex_iterator(code.begin(), code.end(), funcRegex);
    auto end = std::sregex_iterator();

    // Process each function found
    for (auto it = begin; it != end; ++it) {
        std::string funcName = (*it)[1];
        size_t pos = it->position();
        
        // Extract complete function body
        size_t endPos = findMatchingBrace(code, pos + (*it)[0].length());
        if (endPos == std::string::npos) endPos = code.size();

        std::string funcCode = code.substr(pos, endPos - pos + 1);

        // Calculate cyclomatic complexity (if/for/while statements)
        std::regex complexityRegex(R"(\b(if|for|while)\b)");
        int complexity = std::distance(
            std::sregex_iterator(funcCode.begin(), funcCode.end(), complexityRegex),
            std::sregex_iterator()
        );

        // Count total loops for complexity analysis
        std::regex loopRegex(R"(\b(for|while|do)\b)");
        int totalLoops = std::distance(
            std::sregex_iterator(funcCode.begin(), funcCode.end(), loopRegex),
            std::sregex_iterator()
        );

        // Generate improvement suggestions based on metrics
        std::vector<std::string> suggestions;
        int maxNesting = getMaxNestingLevel(funcCode);
        if (maxNesting > 3) suggestions.push_back("Deep nesting detected (level " + std::to_string(maxNesting) + ")");

        int length = getFunctionLength(funcCode);
        if (length > 50) suggestions.push_back("Long function (>50 lines), consider splitting");

        // Check for recursion
        bool recursive = isRecursive(funcName, funcCode);
        if (recursive) suggestions.push_back("Function is recursive");

        // Analyze space usage patterns
        int arrays = countArrays(funcCode);

        // Calculate maximum nested loop depth
        int maxLoopDepth = getMaxLoopDepth(funcCode);

        // Estimate Big O complexities
        std::string timeComplexity = estimateTimeComplexity(maxLoopDepth, recursive, totalLoops);
        std::string spaceComplexity = estimateSpaceComplexity(arrays);

        results.push_back(std::make_tuple(funcName, complexity, suggestions, timeComplexity, spaceComplexity));
    }
    return results;
}

// Calculate maximum brace nesting depth in code
int getMaxNestingLevel(const std::string& code) {
    int maxLevel = 0, currentLevel = 0;
    for (char c : code) {
        if (c == '{') currentLevel++;
        else if (c == '}') currentLevel--;
        if (currentLevel > maxLevel) maxLevel = currentLevel;
    }
    return maxLevel;
}

// Count lines in function (simple line counting)
int getFunctionLength(const std::string& funcCode) {
    std::istringstream stream(funcCode);
    int lines = 0;
    std::string line;
    while (std::getline(stream, line)) lines++;
    return lines;
}
// Check if function calls itself (basic recursion detection)
bool isRecursive(const std::string& funcName, const std::string& funcCode) {
    // Check if function calls itself (simple substring search)
    std::regex callRegex(funcName + R"(\s*\()");
    return std::regex_search(funcCode, callRegex);
}
// Count array and vector declarations (naive approach)
int countArrays(const std::string& funcCode) {
    // Count basic array or vector declarations (very naive)
    std::regex arrRegex(R"(\b(int|float|double|char|std::vector<[^>]+>)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*(\[.*\])?)");
    return std::distance(
        std::sregex_iterator(funcCode.begin(), funcCode.end(), arrRegex),
        std::sregex_iterator()
    );
}

// Calculate maximum depth of nested loops for time complexity analysis
int getMaxLoopDepth(const std::string& funcCode) {
    int maxDepth = 0;
    int currentDepth = 0;
    std::regex loopRegex(R"(\b(for|while|do)\s*\()");
    
    // Track loop positions and their nesting levels
    size_t pos = 0;
    std::vector<int> loopLevels;
    int braceLevel = 0;
    
    // First pass: understand brace structure
    for (size_t i = 0; i < funcCode.size(); i++) {
        if (funcCode[i] == '{') {
            braceLevel++;
        } else if (funcCode[i] == '}') {
            // Clean up loop levels when braces close
            while (!loopLevels.empty() && loopLevels.back() >= braceLevel) {
                loopLevels.pop_back();
            }
            braceLevel--;
        }
    }
    // Reset and calculate actual loop depth
    std::string::const_iterator searchStart(funcCode.cbegin());
    std::smatch match;
    std::vector<size_t> loopPositions;
    
    // Collect all loop starting positions
    while (std::regex_search(searchStart, funcCode.cend(), match, loopRegex)) {
        loopPositions.push_back(match.position() + (searchStart - funcCode.cbegin()));
        searchStart = match.suffix().first;
    }
    
    // Calculate nesting depth for each loop
    for (size_t loopPos : loopPositions) {
        int depth = 0;
        
        // Count brace level at this loop position
        int braces = 0;
        for (size_t i = 0; i < loopPos && i < funcCode.size(); i++) {
            if (funcCode[i] == '{') braces++;
            else if (funcCode[i] == '}') braces--;
        }
        
        // Count containing loops (loops at higher scope levels)
        for (size_t otherPos : loopPositions) {
            if (otherPos < loopPos) {
                int otherBraces = 0;
                for (size_t i = 0; i < otherPos && i < funcCode.size(); i++) {
                    if (funcCode[i] == '{') otherBraces++;
                    else if (funcCode[i] == '}') otherBraces--;
                }
                if (otherBraces < braces) {
                    depth++; // This loop contains our current loop
                }
            }
        }
        
        depth++; // Include the current loop itself
        maxDepth = std::max(maxDepth, depth);
    }
    
    return maxDepth;
}

// Estimate Big O time complexity based on loop structure and recursion
std::string estimateTimeComplexity(int loopDepth, bool recursive, int totalLoops) {
    if (recursive) {
        // Handle recursive functions with additional complexity
        if (totalLoops > 0) {
            return "O(n * 2^n)"; // Recursive with loops
        }
        return "O(2^n)"; // Simple recursion
    }
    
    // Non-recursive complexity based on loop nesting
    if (loopDepth == 0 && totalLoops == 0) return "O(1)";
    if (loopDepth == 1) return "O(n)";
    if (loopDepth == 2) return "O(n^2)";
    if (loopDepth == 3) return "O(n^3)";
    if (loopDepth > 3) return "O(n^" + std::to_string(loopDepth) + ")";
    
    // Fallback cases
    if (totalLoops > 0) return "O(n)";
    return "O(1)";
}

// Estimate space complexity based on array usage
std::string estimateSpaceComplexity(int arrayCount) {
    if (arrayCount == 0) return "O(1)"; // Constant space
    if (arrayCount == 1) return "O(n)"; // Linear space
    return "O(n^" + std::to_string(arrayCount) + ")"; // Polynomial space
}