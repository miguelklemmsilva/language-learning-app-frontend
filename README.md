# language-learning-app-frontend
The frontend code of my language learning app project. I have not provided the server code in case I decide to release the website. There is no active website at the moment because of high server costs due to the use of computationally expensive Hugging Face models.

## The idea
I wrote this app because I wanted an app that allows me to enter vocabulary that I want to learn then create sentences based on those words using ChatGPT so that I can see those words in context. To improve on my language skills for that language at the same time I included various exercises. This includes translation, listening and speaking exercises.

![localhost_3000_](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/6333d298-5f31-4b09-8ce3-0a72ec9a2ba6)

# Pages
## User management
The website uses Auth0 to handle user registration and account management for the best possible security for users. It also allows for users to log in using their Google account.

![dev-k3jnyjgiqp886i26 uk auth0 com_u_login_state=hKFo2SBOaWpvbXdqSnAxSUxwUGlRRnFqY0I0NmpQT1ZMTkQyc6Fur3VuaXZlcnNhbC1sb2dpbqN0aWTZIEFsTlJiZXYyczV0aWkzS244bDZ2ZXZzMi10aGV0bkVUo2NpZNkgNlZoYXp4dEw3ZWhWeWhXaFhXM0RkcURKc](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/17453cd6-585a-4415-927d-8583ce564cf8)

## Home
The home screen contains all essential information such as words to practice and your active exercises.

![localhost_3000_home (4)](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/3c22d47d-8ce4-4a60-8edc-7c0497011dcc)

## Vocabulary Table
The vocabulary table is sorteable by any category. It also allows for you to delete any words you want.

![localhost_3000_home (5)](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/ece3275e-c41b-46af-b76e-cbff6b37045e)

When you press Add Vocabulary it brings up a modal window with a text box. The words are then sent to the server to check if they are valid. If they are, they're added to the vocabulary table.

![localhost_3000_home (3)](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/7b39cf65-fb2d-443c-8725-ca30fb258eb8)

## Settings
In the Language Settings you can add, delete, choose the active language and modify language settings. You can choose dialects and accents (if applicable) and which exercises you would like to do.

![localhost_3000_home (6)](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/984c0268-91fb-4f95-a28c-655edfb626f7)

# Exercises
## Translation
In the translation exercise, the user must translate from their native language into the native language. With azure translation, there are mappings between the source and target language. This allows for tips for when a user hovers over a word in case they need help.

![localhost_3000_home (7)](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/0e527c3c-6594-46bb-8d0e-c6103a2456ac)

### Translation verification
There are many ways to translate a sentence, there usually is no one correct answer. So to verify whether a sentence is correct or not I used Hugging Face models to check sentence similarity between the user translation and original, and I used the models to verify sentence fluency (for grammar checking).
#### Sentence similarity
To calculate sentence similarity, I used the [paraphrase-xlm-r-multilingual-v1](https://huggingface.co/sentence-transformers/paraphrase-xlm-r-multilingual-v1) model. Using this model I can generate sentence embeddings then find the cosine distance of the embeddings to derive a score between 0 and 1.
#### Sentence fluency
If a user writes a sentence that is similar enough to the original it is possible that it can be similar enough to be validated on the basis of sentence similarity but it can still be gramatically incorrect. To resolve this I added a check for sentence fluency.

![localhost_3000_home (10)](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/eeb0c57a-473a-4a35-a522-2d6ab7629c00)
Although the sentences aren't the exact same, they mean the exact same thing so the algorithm has decided the translation is correct.


[xlm-roberta-base](https://huggingface.co/xlm-roberta-base) is used to mask each token in the sentence one by one and see how probable the original token is according to the model's prediction. If the sentence is grammatically correct, the model should assign high probabilities to the original tokens.
The [Language Tool](https://languagetool.org/) API is also used for rules based checking of grammar. Roberta is useful for more subtle grammatical mistakes.

## Listening
The Azure Text to Speech API is used to generate lifelike speech to practice listening in the target language. The accent of the voice will change depending on which country was selected for the language.

![localhost_3000_home (8)](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/fa86695a-2fbc-4e61-b459-d5a846394992)

## Speaking
[Azure Pronunciation Assessment](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment-tool?tabs=display) is used to give feedback on a user's pronunciation. The user receives 3 unique scores: Accuracy, Fluency and Completeness. The accuracy of the pronunciation is broken down further into individual words, a score for that is given for each word pronounced.

![localhost_3000_home (9)](https://github.com/miguel4521/language-learning-app-frontend/assets/109853127/abadadee-53e1-4f4b-8869-2ab4c1c6efa3)
