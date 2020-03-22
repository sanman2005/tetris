import * as React from 'react';
import cn from 'classnames';

import { Form, TFormSubmit } from 'components/Form';
import { InputName } from 'components/Input';
import Button from 'components/Button';

import i18n from 'js/i18n';

type TVacancyAddProps = {
  projectId: string;
  onAdd?: () => void;
  onSubmit?: undefined;
} | {
  projectId?: undefined;
  onAdd?: undefined;
  onSubmit: TFormSubmit;
};

const CLASS = 'vacancy-add';

export default class VacancyAdd extends React.Component<TVacancyAddProps> {
  state = {
    error: '',
    showForm: false,
  };

  onSubmit: TFormSubmit = (data, onSuccessHook) => {
    const { onAdd } = this.props;

    onSuccessHook();

    if (onAdd) {
      onAdd();
    }
  }

  onShow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.setState({ showForm: true });
  }

  render() {
    const { error, showForm } = this.state;
    const { onSubmit } = this.props;

    return (
      <div className={cn(CLASS, {
        [`${CLASS}--form-show`]: showForm,
      })}>
        <div className={`${CLASS}__form`}>
          {showForm && (
            <Form
              error={error}
              fields={{
                name: <InputName label={i18n`title`} pattern={null} required />,
              }}
              onSubmit={onSubmit || this.onSubmit}
              sendText={i18n`save`}
              renderAsDiv
            />
          )}
        </div>
        <Button
          className={`${CLASS}__button`}
          text={i18n`add`}
          onClick={this.onShow} />
      </div>
    );
  }
}
