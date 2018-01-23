import React from 'react';
import PropTypes from 'prop-types';

const compose = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args));

// TODO fix this, make it more generic
const update = type => (object, key, value) => ({
  ...object,
  [type]: {
    ...object[type],
    [key]: value,
  },
});

export default class Form extends React.Component {
  static propTypes = {
    initialValues: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    validators: PropTypes.object,
  };

  static defaultProps = {
    validators: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      values: this.props.initialValues || {},
      touched: {},
      errors: {},
      valid: {},
      isSubmitting: false,
    };
    this.validate = this.validate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onBlur = e => {
    e.persist();
    const { id, name } = e.target;
    const inputName = name || id;
    this.validate(inputName);
  };

  onChange = e => {
    e.persist();
    const { id, name, type } = e.target;
    const inputName = name || id;
    if (!id) {
      throw new Error(
        'Elements should have an attribute id',
        e.target.outerHTML,
      );
    }
    const value = type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState(oldState =>
      update('touched')(
        update('values')(oldState, inputName, value),
        inputName,
        true,
      ),
    );

    // check if any validations need to be run
    if (type === 'radio' || e.target.dataset.validateOnChange) {
      this.validate(inputName);
    }
  };

  setSubmitting = val => this.setState({ isSubmitting: val });

  setValues = values =>
    this.setState(old => ({
      ...old,
      values: {
        ...old.values,
        ...values,
      },
    }));

  fieldProps = ({ onChange, onBlur, ...rest } = {}) => ({
    onChange: compose(this.onChange, onChange),
    onBlur: compose(this.onBlur, onBlur),
    ...rest,
  });

  async validate(inputName) {
    const validators = this.props.validators[inputName] || [];
    const error = await validators.reduce(async (acc, validator) => {
      const lastError = await acc;
      if (lastError && !lastError.valid) return lastError;
      this.setState(oldState => update('valid')(oldState, inputName, true));
      const result = await Promise.resolve(
        validator(this.state.values[inputName]),
      );
      this.setState(oldState => update('valid')(oldState, inputName, false));
      return result;
    }, null);

    error &&
      this.setState(oldState =>
        update('errors')(oldState, inputName, error.message),
      );

    return error;
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setSubmitting(true);
    const allInputs = Object.keys(this.props.initialValues);
    // touch all fields so that errors are visible
    this.setState({
      touched: allInputs.reduce((result, k) => ({ ...result, [k]: true }), {}),
    });
    // run validations
    const errors = await Promise.all(allInputs.map(k => this.validate(k)));
    const isValid = !errors.filter(err => err && !err.valid).length;

    if (isValid) {
      if (typeof this.props.onSubmit === 'function') {
        this.props.onSubmit({
          setSubmitting: this.setSubmitting,
          values: this.state.values,
          isValid,
        });
      }
      return;
    }
    // else don't submit
    this.setSubmitting(false);
  }

  render() {
    return this.props.children({
      values: this.state.values,
      touched: this.state.touched,
      errors: this.state.errors,
      valid: this.state.valid,
      isSubmitting: this.state.isSubmitting,
      fieldProps: this.fieldProps,
      handleSubmit: this.handleSubmit,
      setValues: this.setValues,
      setSubmitting: this.setSubmitting,
    });
  }
}
