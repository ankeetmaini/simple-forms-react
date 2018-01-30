# simple-forms-react

> yet another Form component

# install

```
npm i -S simple-forms-react
```

# usage

# `Form` props

| name          | type     | default                                                                                                      | description                                                                                                       |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| initialValues | Object   | {}                                                                                                           | you should pass all the fields as keys and their default/initial values                                           |
| children      | function | `({values, touched, errors, valid, isSubmitting, fieldProps, handleSubmit, setValues, setSubmitting}) => {}` | this function should return the JSX which contains the form and all inputs                                        |
| validators    | Object   | {}                                                                                                           | this contains validators for each input, please see Validator section to see the contract of a validator function |

# `children` function arguments

| name          | type     | description                                                                                                                                                                |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| values        | Object   | contains values of all the inputs                                                                                                                                          |
| touched       | Object   | key-value of inputs and whether they've been touched or not                                                                                                                |
| errors        | Object   | errors object contains error message for inputs if there's an error                                                                                                        |
| valid         | boolean  | tells if the entire form is valid or not                                                                                                                                   |
| isSubmitting  | boolean  | tells if the form is submitting, useful to make your submit button disabled or hide altogether                                                                             |
| fieldProps    | function | this returns the props that need to be applied on the input, you should pass all the props in as an object, it chains onChange and other things which Form uses internally |
| handleSubmit  | function | use this as onSubmit prop of `<form>`                                                                                                                                      |
| setValues     | function | accepts an object and updates the values of the inputs as per the passed argument                                                                                          |  |
| setSubmitting | function | a helper utility to change the `isSubmitting` flag.                                                                                                                        |
