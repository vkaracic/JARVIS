from random import randint


def generate_positive():
    for i in range(100):
        single_data_set = []
        single_data_set.append(randint(1, 10))
        for i in range(randint(2, 5)):
            x = 0
            num = randint(x, 50)
            while num <= single_data_set[-1]:
                x += 5
                num = randint(x, 50 + x)
            single_data_set.append(num)
        output = ', '.join(str(digit) for digit in single_data_set)
        print output + ', 1'


def generate_negative():
    for i in range(100):
        single_data_set = []
        single_data_set.append(randint(40, 50))
        for i in range(randint(2, 5)):
            x = 40
            num = randint(x, 50)
            while num > single_data_set[-1]:
                x -= 10
                num = randint(x, 50)
            single_data_set.append(num)
        output = ', '.join(str(digit) for digit in single_data_set)
        print output + ', 0'


generate_positive()
generate_negative()