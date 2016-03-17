import re


#utility class given a weka result file as a ctor arg, can evaluate the result on several target functions 
class Utility:
    def __init__():
        confMat = re.compile("=== Confusion Matrix ===")
        with open(resultFile, "r") as result:
            count = sum(1 for m in re.finditer(confMat, result.read()))
            result.seek(0)
            lines = result.readlines()

        confusionMatrix = []

        seen = 0 if count == 2  else 1
        for i in range(len(lines)):
            if (bool(re.search(confMat, lines[i]))):
                seen += 1
            if (seen == 2):
                confusionMatrix = lines[i + 3:]
                break

        confusionMatrix = [item for item in confusionMatrix if item != "\n"]
        for i in range(len(confusionMatrix)):
            confusionMatrix[i] = confusionMatrix[i][:confusionMatrix[i].index("|")]
            confusionMatrix[i] = [item for item in re.split("[ ]", confusionMatrix[i].strip()) if item != ""]

        COLS = len(confusionMatrix[0])
        numericMatrix = [[] for i in range(len(confusionMatrix))]
        bingo = 0

        for row in range(len(confusionMatrix)):
            for col in range(COLS):
                value = int(confusionMatrix[row][col])
                numericMatrix[row].append(value)
        self.matrix = numericMatrix

    def exact(self):
        return sum([self.matrix[i][i] for i in range(len(matrix))])

    def within(self, delta):
        return sum([self.getDelta(i, delta) for i in range(len(matrix))])

    def predictionVsTrue(self):
        return sum([self.matrix[i,j] for j in range(i + 1) for i in range(len(self.matrix))])

    def getDelta(self, i,delta):
        value = 0
        for step in range(-delta, delta):
            if 0 <= i + step < len(self.matrix):
                value += self.matrix[i][i + step]
        return value

