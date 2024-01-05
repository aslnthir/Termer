<template lang="md">
# Test info page

Termer should work with all browsers except, Internet Explorer. Currently the best performance is seen in Chrome and in Edge.

## Known issues with the test IATE version of Termer
### Limitation in language pairs.
IATE has over 500 language pairs. For the test we have only implemented
English to English and English to French. Currently Only the English to English translation will provide the link back to the full IATE user interface.

Going forward all languages can be added with links back to the full IATE interface.

### Missing link back to the full IATE interface for French
The English to French translation is stored on our server. Therefore there is no link back to the IATE interface. To see this link you need to select the English to English language pair.

### Noise words underlined.
IATE contains some words that can be perceived as noise when underlined.
We have established a list to exclude such words.

Going forward we can propose to add a user interface to enable each user to add words to a private exclusion list. Such lists could be general or related to a given language pair or domain. The individual lists could be shared and aligned to be used in one unit or across units.

### The Termer button is not shown on some pages
Some pages block the Termer functionality and therefore the Termer button does not appear.
One example page is the [Legislative Observatory](https://oeil.secure.europarl.europa.eu/oeil/home/home.do)
The website administrator of the blocking websites can make a small configuration change to allow Termer to work.

### Plural forms are not underlined
Currently Termer will underline only words and phrases exactly as they are stored in IATE.

Going forward we may consider to add support for stemming.

* Welcome to send feedback using the feedback button.

## Suggestions for what to test:

- What are helpful features?
- What are you yet missing?
- What would need to be changed to make it really helpful?
- Are there other sources not included we should add?
- Cases where the markup does not work as expected?
- Cases where the search result does not include what you expect?
- User interface improvements to make the interaction more fluid ...
