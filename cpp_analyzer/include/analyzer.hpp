#ifndef ANALYZER_HPP
#define ANALYZER_HPP

#include <string>
#include <map>
#include <vector>
#include <tuple>

class Analyzer {
public:
    Analyzer(const std::string& filename);

    // Returns summary metrics: functions, loops, conditionals counts
    std::map<std::string, int> analyze();

    // Returns vector of (function name, complexity, suggestions, time complexity, space complexity)
    std::vector<std::tuple<
    std::string,           // function name
    int,                   // complexity
    std::vector<std::string>, // suggestions/issues
    std::string,           // time complexity estimate
    std::string            // space complexity estimate
>> analyzeFunctions();

private:
    std::string code;

    void loadFile(const std::string& filename);
    int countFunctions();
    int countLoops();
    int countConditionals();
};

#endif
