str1 = "sagar ekunde"
str2= "ekun"

for i in range(0, len(str1)):
    val = i
    if str1[i] == str2[0]:
        increment = i + 1
        for j in range(1, len(str2)):
            if str1[increment] == str2[j]:
                increment = increment + 1
            else:
                val = -1
                break
        print(val)