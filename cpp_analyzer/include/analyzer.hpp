#ifndef ANALYZER_HPP
#define ANALYZER_HPP

#include <string>
#include <map>

class Analyzer {
public:
    Analyzer(const std::string& filename);
    std::map<std::string, int> analyze();
private:
    std::string code;
    void loadFile(const std::string& filename);
    int countFunctions();
    int countLoops();
    int countConditionals();
};

#endif
