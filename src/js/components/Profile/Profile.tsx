import * as React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';

import Icons from '../icons';
import Button from '../Button';
import { TFormSubmit, TFormData, TFormHandlers, Form } from '../Form';
import { InputEmail, InputName, InputPassword, InputImage } from '../Input';
import { Content, Column, Row } from '../Grid';

import Account, { IPasswordParams, IProfileParams } from 'models/account';
import { pagesPath } from 'pages/index';
import i18n from 'js/i18n';

enum Stages {
  info = 'info',
  edit = 'edit',
  password = 'password',
}

interface IProfileState {
  stage: Stages;
  error: string;
  selectedPhoto: Blob;
}

@observer
class Profile extends React.Component<RouteComponentProps, IProfileState> {
  state: IProfileState = {
    stage: Stages.info,
    error: '',
    selectedPhoto: null,
  };
  profileParams: IProfileParams = null;

  changeStage(stage: Stages) {
    this.setState({ stage, error: '' });
  }

  async updateProfile(formData: TFormData) {
    try {
      if (!this.profileParams) {
        this.profileParams = formData as IProfileParams;
      }

      const { selectedPhoto } = this.state;

      if (selectedPhoto) {
        formData.photo = selectedPhoto;
      }

      await Account.setUserData(formData as IProfileParams);

      this.setState({ selectedPhoto: null });
      Account.getData(true);
    } catch (errorMessage) {
      this.setState({ error: i18n`failed update profileData` });
    }

    this.profileParams = null;
    this.changeStage(Stages.info);
  }

  async updatePassword(formData: TFormData, onSuccess?: () => void) {
    const data = formData as IPasswordParams;

    if (data.passwordRepeat !== data.password) {
      this.setState({ error: i18n`passwordsMismatch` });
      onSuccess();
      return;
    }

    try {
      await Account.setPassword(data);

      this.changeStage(Stages.info);
    } catch (error) {
      this.setState({ error: error.message });
    }

    onSuccess();
  }

  onFormSubmit: TFormSubmit = (formData, formSuccessHook, formErrorHook) => {
    const { stage } = this.state;
    const handlers: TFormHandlers = {
      [Stages.edit]: this.updateProfile,
      [Stages.password]: this.updatePassword,
    };
    const handler = handlers[stage];

    handler.call(this, formData, formSuccessHook, formErrorHook);
    formSuccessHook();
  }

  onCancelEdit = () =>
    this.setState({
      stage: Stages.info,
      selectedPhoto: null,
    })

  get stageContent() {
    const { error } = this.state;
    const account = Account.getData().value;
    const { nameFirst, nameLast, email, username } = Account.getData().value;

    const stagesContent: { [key: string]: JSX.Element } = {
      [Stages.info]: (
        <div className='profile__info'>
          <div className='profile__name'>
            {account.nameFirst} {account.nameLast}
            <Button
              className='profile__exit'
              href={pagesPath.logout}
              icon={<Icons.exit />}
              type='icon-main'
              shadow
            />
          </div>
          <div className='profile__links'>
            <div className='profile__links-title'>{i18n`projects`}</div>
            <Row>
            </Row>
          </div>
          <Button
            className='profile__edit-button'
            shadow
            text={i18n`change profileData`}
            type='main'
            onClick={() => {
              this.profileParams = null;
              this.changeStage(Stages.edit);
            }}
          />
        </div>
      ),
      [Stages.edit]: (
        <div className='profile-edit'>
          <Form
            fields={{
              username: (
                <InputName label={i18n`login`} value={username} required />
              ),
              email: <InputEmail value={email} required={!!email} />,
              nameFirst: <InputName value={nameFirst} />,
              nameLast: <InputName label={i18n`surname`} value={nameLast} />,
            }}
            sendText={i18n`save`}
            buttons={[
              <Button
                text={i18n`cancel`}
                onClick={() => this.onCancelEdit()}
                type='light'
              />,
            ]}
            onSubmit={this.onFormSubmit}
            submitType='main2'
            noFocus
            error={error}
          />
          <Button
            className='profile-edit__password'
            onClick={() => this.changeStage(Stages.password)}
            text={i18n`change password`}
          />
        </div>
      ),
      [Stages.password]: (
        <Form
          className='profile-password'
          fields={{
            passwordOld: (
              <InputPassword label={i18n`old password`} autocomplete='off' />
            ),
            password: (
              <InputPassword label={i18n`new password`} autocomplete='off' />
            ),
            passwordRepeat: (
              <InputPassword
                label={i18n`confirm new password`}
                autocomplete='off'
              />
            ),
          }}
          sendText={i18n`save`}
          buttons={[
            <Button
              text={i18n`cancel`}
              onClick={() => this.changeStage(Stages.info)}
              type='light'
            />,
          ]}
          onSubmit={this.onFormSubmit}
          submitType='main2'
          noFocus
          error={error}
        />
      ),
    };

    return stagesContent[this.state.stage];
  }

  handlePhotoChange = (file: Blob) => this.setState({ selectedPhoto: file });

  render() {
    const account = Account.getData().value;

    if (!account) {
      return <Redirect to='/' />;
    }

    const { stage } = this.state;
    const photoClass = 'profile__photo';
    const canChangePhoto = stage === Stages.edit;

    return (
      <Content title={i18n`profile`}>
        <div className='profile'>
          <div className={photoClass}>
            {canChangePhoto ? (
              <InputImage onChange={this.handlePhotoChange} />
            ) : account.photo ? (
              <img src={account.photo} alt={account.username} />
            ) : (
              <div className={`${photoClass}-empty`}>
                <Icons.avatar />
              </div>
            )}
          </div>

          {this.stageContent}
        </div>
      </Content>
    );
  }
}

export default withRouter(Profile);
