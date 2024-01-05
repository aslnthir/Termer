#! /usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import json

regex = r"\$t\(\'(.+?)\'\)"

def get_all_translation_strings():
    dirs = ['../src/components', '../src/views', 'src/components', 'src/views']
    list_of_translation_strings = []
    for dir in dirs:
        for subdir, di, files in os.walk(dir):
            for file in files:
                filepath = subdir + os.sep + file
                if filepath.endswith(".vue"):
                    file = open(filepath,'r')
                    match = re.findall(regex, file.read(), re.MULTILINE)
                    list_of_translation_strings += match
    return list_of_translation_strings

def get_translation_paths():
    dir = '../src/locales'
    paths = []
    for subdir, di, files in os.walk(dir):
        for file in files:
            if file.endswith(".json"):
                filepath = subdir + os.sep + file
                paths.append(filepath)
                #file = open(filepath,'r')
                #json_dir = json.loads(file.read())
                #print (json_dir)
    return paths

def add_translation_strings(paths, translation_list):
    test = {}
    for filepath in paths:
        test[filepath] = 0
        file = open(filepath,'r')
        exsising_translations = json.loads(file.read())
        for trans_string in translation_list:
            if not trans_string in exsising_translations:
                test[filepath] += 1
                exsising_translations[trans_string] = None
        newF = open(filepath, 'w+', encoding='utf-8')
        newF.write(json.dumps(exsising_translations, indent=2, sort_keys=True, ensure_ascii=False))


if __name__ == '__main__':
    list = get_all_translation_strings()
    paths = get_translation_paths()
    add_translation_strings(paths, list)
