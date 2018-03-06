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
    // we don't know if this is an event object or not.
    e.persist && e.persist();
    const { id, name } = e.target;
    const inputName = name || id;
    this.validate(inputName);
  };

  getValue = (e, id, type) => {
    const valueAccessor = this.valueAccessors[id];
    if (valueAccessor) return valueAccessor(e);
    return type === 'checkbox' ? e.target.checked : e.target.value;
  };

  onChange = e => {
    e.persist && e.persist();
    const { id, name, type } = e.target;
    const inputName = name || id;
    if (!id) {
      throw new Error(
        'Elements should have an attribute id',
        e.target.outerHTML,
      );
    }

    const value = this.getValue(e, id, type);

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

  fieldProps = ({
    onChange,
    onBlur,
    validators,
    valueAccessor,
    ...rest
  } = {}) => {
    // throw if no id
    if (!rest.id) throw new Error('Elements should have an attribute id');

    // set nice defaults
    this.validators = this.validators || {};
    this.valueAccessors = this.valueAccessors || {};

    if (validators) this.validators[rest.id] = validators;
    if (valueAccessor) this.valueAccessors[rest.id] = valueAccessor;

    return {
      onChange: compose(this.onChange, onChange),
      onBlur: compose(this.onBlur, onBlur),
      ...rest,
    };
  };

  async validate(inputName) {
    const validators =
      this.props.validators[inputName] ||
      (this.validators || {})[inputName] ||
      [];
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
    e && e.preventDefault();
    this.setSubmitting(true);
    const allInputs = Object.keys({
      ...this.props.initialValues,
      ...this.state.values,
      ...this.props.validators,
      ...(this.validators || {}),
    });
    // touch all fields so that errors are visible
    this.setState({
      touched: allInputs.reduce((result, k) => ({ ...result, [k]: true }), {}),
    });
    // run validations
    const allValidators = { ...this.props.validators, ...this.validators };
    const errors = await Promise.all(
      Object.keys(allValidators).map(k => this.validate(k)),
    );
    const isValid = !errors.filter(err => err && !err.valid).length;

    if (isValid) {
      if (typeof this.props.onSubmit === 'function') {
        this.props.onSubmit({
          setSubmitting: this.setSubmitting,
          values: this.state.values,
          isValid,
          setValues: this.setValues,
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

export const emptyValidator = val =>
  val ? { valid: true } : { valid: false, message: 'Cannot be empty' };
