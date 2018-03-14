# simple-forms-react

> yet another Form component

# install

```
npm i -S simple-forms-react
```

# usage (simple, no validation)

```js
import React from 'react';
import { render } from 'react-dom';
import 'regenerator-runtime/runtime';

import Form from 'simple-forms-react';

const App = () => (
  <div>
    <h2>Simple Forms React!</h2>
    <Form
      initialValues={{
        itemName: 'Coconut',
      }}
      onSubmit={({ values }) => {
        console.log(values);
      }}
    >
      {({ values, touched, fieldProps, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div>
            <input
              {...fieldProps({
                id: 'itemName',
                placeholder: 'Type to add item name',
                value: values.itemName,
              })}
            />
            {touched.itemName && values.itemName && <h5>{values.itemName}</h5>}
          </div>
          <div>
            <select
              {...fieldProps({
                id: 'fruit',
                value: values.fruit,
              })}
            >
              <option value="">---select---</option>
              <option value="apple">apple</option>
              <option value="orange">orange</option>
              <option value="grapes">grapes</option>
            </select>
            {touched.fruit && values.fruit && <h5>{values.fruit}</h5>}
          </div>
          <input type="submit" value="Submit" />
        </form>
      )}
    </Form>
  </div>
);

render(<App />, document.getElementById('root'));
```

[![Edit form-example-basic](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/r570l9r33m)

# usage (with validation, sync and async)

```js
import React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import 'regenerator-runtime/runtime';
import Form from 'simple-forms-react';
import Spinner from './Spinner';

const Container = styled.div`
  padding: 10px;
`;
const ButtonDiv = styled.div`
  margin: 30px 0;
`;
const Error = styled.div`
  color: red;
`;
const InputHolder = styled.div`
  margin: 12px 0;
`;

const nameValidator = val => {
  const regex = new RegExp(/^\d+$/);
  return !regex.test(val)
    ? { valid: true }
    : { valid: false, message: 'No numbers allowed' };
};
const emptyValidator = val =>
  !val ? { valid: false, message: 'This is required' } : { valid: true };

const usernameValidator = val =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve({ valid: true }), 5000);
  });

const App = () => (
  <Container>
    <h1>simple-forms-react</h1>
    <Form
      initialValues={{
        name: '',
        username: '',
      }}
      validators={{
        name: [emptyValidator, nameValidator],
        username: [emptyValidator, usernameValidator],
      }}
      onSubmit={({ values, setSubmitting }) => {
        console.log('Submitted values: ', values);
        setSubmitting(false);
      }}
    >
      {({
        values,
        touched,
        errors,
        valid,
        fieldProps,
        handleSubmit,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit}>
          <InputHolder>
            <label>Name: </label>
            <input
              {...fieldProps({
                id: 'name',
                value: values.name,
                placeholder: 'Enter your name',
              })}
            />
            {touched.name && errors.name && <Error>{errors.name}</Error>}
          </InputHolder>
          <InputHolder>
            <label>Username</label>
            <input
              {...fieldProps({
                id: 'username',
                value: values.username,
                placeholder: 'type your username',
              })}
            />
            {valid.username && <Spinner radius="10" stroke="2" />}
            {touched.username &&
              errors.username && <Error>{errors.username}</Error>}
          </InputHolder>
          <ButtonDiv>
            {isSubmitting ? (
              <Spinner />
            ) : (
              <input type="submit" value="Submit" />
            )}
          </ButtonDiv>
        </form>
      )}
    </Form>
  </Container>
);

render(<App />, document.getElementById('root'));
```

[![Edit Form Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/9ljqypo87o)

# third-party components integration

* [react-select](https://github.com/JedWatson/react-select) integration [![Edit form-example-basic](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/1xvn0z81j)

# api

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
