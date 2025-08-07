CXX = g++
CXXFLAGS = -std=c++17 -Iinclude
SRC = src/main.cpp src/analyzer.cpp
OUT = analyzer

all: $(OUT)

$(OUT): $(SRC)
	$(CXX) $(CXXFLAGS) -o $(OUT) $(SRC)

clean:
	rm -f $(OUT)