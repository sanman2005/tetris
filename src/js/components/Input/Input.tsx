import * as React from 'react';
import InputMask from 'react-input-mask';
import cn from 'classnames';
import Textarea from 'react-textarea-autosize';

import {
  Reasons,
  ValidationComponent,
  IValidationProps,
  IValidationState,
} from '../Validation';

import {
  emailPattern,
  namePattern,
  passwordPattern,
  phonePattern,
} from '../../helpers';
import Icons from '../icons';
import i18n from 'js/i18n';
import { LegacyRef } from 'react';

export const phoneMask = '+7 (999) 999-99-99';

interface IInputProps extends IValidationProps {
  autocomplete?: string;
  className?: string;
  mask?: string;
  onChange?(value: string, name?: string): void;
  onClick?(event: React.FormEvent): void;
  type?: string;
  value?: string;
  isTextarea?: boolean;
  isSelect?: boolean;
}

interface StateType {
  value: string;
}

type TInput = HTMLInputElement | HTMLTextAreaElement;
type TRef = React.Ref<TInput>;
type TRefInput = React.Ref<HTMLInputElement>;
type TRefText = React.Ref<HTMLTextAreaElement>;

// tslint:disable:variable-name
export const Input = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => {
    class InputComponent extends ValidationComponent<IInputProps, StateType> {
      onChange = (event: React.FormEvent<TInput>) => {
        const { value } = event.currentTarget;
        const { onChange, name } = this.props;

        this.setState({ value });

        onChange?.(value, name);
        event.currentTarget.focus();
      };

      onFocus = (event: React.FormEvent<TInput>) => {
        const { onFocus, name } = this.props;

        onFocus?.(name, event.currentTarget);

        return true;
      };

      render() {
        const {
          autocomplete,
          className,
          isTextarea,
          label,
          name,
          mask,
          onClick,
          required,
          type,
          showError,
        } = this.props;

        const { value } = this.state;

        const inputParams: any = {
          autoComplete: autocomplete,
          name,
          onClick,
          value,
          type,
          onChange: this.onChange,
          onFocus: this.onFocus,
        };
        const error = this.validationError;
        const fieldClass = cn('input', className, {
          'input--error': error && showError,
          'input--text': isTextarea,
          'input--required': required,
        });

        const labelClass = cn('input__label', {
          'input__label--not-empty': value,
        });

        if (isTextarea && ref) {
          inputParams.inputRef = ref as TRefText;
        }

        const input = mask ? (
          <InputMask {...inputParams} mask={mask} />
        ) : isTextarea ? (
          <Textarea {...inputParams} maxRows={15}>
            {value}
          </Textarea>
        ) : (
          <input {...inputParams} ref={ref as TRefInput} />
        );

        return (
          <fieldset className={fieldClass} data-value={value}>
            {input}
            <span className={labelClass}>{label}</span>
            {error && showError && (
              <span className='input__error'>{error}</span>
            )}
          </fieldset>
        );
      }
    }

    return <InputComponent {...props} />;
  },
);

export const InputName = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      ref={ref}
      label={i18n`name`}
      pattern={namePattern}
      validationTexts={{
        [Reasons.required]: i18n`enter text`,
        [Reasons.pattern]: i18n`fieldLettersOnly`,
      }}
      {...props}
    />
  ),
);

export const InputEmail = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      label='Email'
      type='email'
      ref={ref}
      pattern={emailPattern}
      required
      validationTexts={{
        [Reasons.required]: i18n`enter email`,
        [Reasons.pattern]: i18n`emailFormat`,
      }}
      {...props}
    />
  ),
);

export const InputText = React.forwardRef<TInput, IInputProps>(
  (props: IInputProps, ref: TRef) => (
    <Input
      isTextarea
      ref={ref}
      maxLength={1000}
      validationTexts={{
        [Reasons.required]: i18n`enter text`,
        [Reasons.maxLength]: i18n`text tooLong`,
      }}
      {...props}
    />
  ),
);

type TInputFileProps = {
  accept?: string;
  onInit?: (input: HTMLInputElement) => void;
  onChange: (url: string, file: Blob | null) => void;
};

export const InputFile = (props: TInputFileProps) => {
  const { accept, onChange, onInit } = props;
  const ref = React.useRef<HTMLInputElement>();

  React.useEffect(() => {
    if (onInit && ref.current) {
      onInit(ref.current);
    }
  }, [onInit]);

  const onFileChange = (event: any) => {
    const file: Blob = event.target.files[0];
    const fileReader = new FileReader();

    if (!file) {
      onChange('', null);
      return;
    }

    fileReader.readAsDataURL(file);
    fileReader.addEventListener('loadend', (readerEvent: any) =>
      onChange(readerEvent.target.result, file),
    );
  };

  return (
    <input
      type='file'
      accept={accept || '.jpg, .jpeg, .png'}
      onChange={onFileChange}
      ref={ref as LegacyRef<HTMLInputElement>}
    />
  );
};

type TInputImageProps = {
  label?: string;
  url?: string;
} & IValidationProps;

type TInputImageState = {
  file: Blob | null;
  url: string;
} & IValidationState;

export class InputImage extends ValidationComponent<
  TInputImageProps,
  TInputImageState
> {
  constructor(props: TInputImageProps) {
    super(props);

    this.state = {
      ...this.state,
      file: null,
      url: this.props.url || '',
    };
  }

  onChange = (url: string, file: Blob | null) => {
    const { onChange, name } = this.props;

    this.setState({
      file,
      url,
      value: file,
      validation: this.state.validation,
    });

    onChange?.(file, name);
  };

  render() {
    const { url } = this.state;

    return (
      <fieldset className='input input-image'>
        <img src={url} alt='' />
        <label className='input-image__label'>
          {this.props.label}
          <InputFile onChange={this.onChange} />
        </label>
        <div className='input-image__camera'>
          <Icons.camera />
        </div>
        {url && (
          <div
            className='input-image-delete'
            onClick={() => this.onChange('', null)}
          />
        )}
      </fieldset>
    );
  }
}

export default Input;
