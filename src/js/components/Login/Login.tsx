import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Link, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import cn from 'classnames';
import { GoogleLogin, GoogleLoginResponseOffline } from 'react-google-login';

import Button from '../Button';
import { InputEmail, InputName, InputPassword } from '../Input';
import { Form, TFormHandlers, TFormSubmit } from '../Form';
import { Reasons } from '../Validation';
import NotFound from '../NotFound';
import { Content } from '../Grid';
import Switcher from '../Switcher';
import Icons from '../icons';

import Account, { IAuthParams, IRegisterParams } from 'models/account';
import { pagesPath } from 'pages/index';
import i18n from 'js/i18n';
import { social } from '../../../../config/app.config.json';

export enum Stages {
  login = 'login',
  register = 'register',
  recovery = 'recovery',
  passwordNew = 'passwordNew',
}

interface ILoginProps {
  stage?: Stages;
}

interface ILoginState {
  error: string;
  stage: Stages;
}

type TLoginProps = ILoginProps & RouteComponentProps<ILoginProps>;
type TLoginState = ILoginProps & ILoginState;
type TRegisterParams = IRegisterParams & {
  passwordNew: string;
  passwordRepeat: string;
};

class LoginComponent extends React.Component<TLoginProps, TLoginState> {
  state = {
    error: '',
    stage: this.props.stage || this.props.match.params.stage || Stages.login,
  };
  login = Account.getLogin();

  getStageUrl = (stage: Stages) =>
    `${pagesPath.login}/${stage === Stages.login ? '' : stage}`

  getStageText = (stage: Stages): string =>
    (({
      [Stages.login]: i18n`signin`,
      [Stages.register]: i18n`signup`,
      [Stages.recovery]: i18n`recoveryAccess`,
      [Stages.passwordNew]: i18n`enter new password`,
    } as any)[stage])

  getLinkToStage = (
    stage: Stages,
    buttonText: string = '',
    light?: boolean,
  ) => (
    <Link
      to={this.getStageUrl(stage)}
      onClick={() => this.changeStage(stage)}
      className={cn('login__link link', { 'link--light': light })}
    >
      {buttonText ? buttonText : this.getStageText(stage)}
    </Link>
  )

  getStageTitle = (stage: Stages): React.ReactNode =>
    ({
      [Stages.login]: (
        <Switcher
          items={[
            this.getStageText(Stages.login),
            this.getLinkToStage(Stages.register),
          ]}
        />
      ),
      [Stages.register]: (
        <Switcher
          activeIndex={1}
          items={[
            this.getLinkToStage(Stages.login),
            this.getStageText(Stages.register),
          ]}
        />
      ),
      [Stages.recovery]: this.getStageText(Stages.recovery),
    } as any)[stage]

  async changeStage(stage: Stages) {
    this.props.history.push(this.getStageUrl(stage));
  }

  onSignIn() {
    Account.clearLogin();
    this.props.history.push('/');
  }

  async sendLogin(formData: IAuthParams, onSuccessHook: () => void) {
    try {
      await Account.authenticate(formData);

      this.onSignIn();
    } catch (errorMessage) {
      const error =
        {
          [Account.messages.invalidLoginOrPassword]:
            i18n`invalidLoginOrPassword`,
        }[errorMessage] || i18n`failed auth`;

      this.setState({ error });
      onSuccessHook();
    }
  }

  sendGoogleAuth = async ({ code }: GoogleLoginResponseOffline) => {
    try {
      await Account.authenticateGoogle(code);

      this.onSignIn();
    } catch (errorMessage) {
      const error = i18n`failed authGoogle`;

      this.setState({ error });
    }
  }

  sendRegister: TFormSubmit = async (formData, onSuccessHook, onErrorHook) => {
    this.login = formData.username;
    sessionStorage.setItem('login', this.login);

    if (formData.passwordNew !== formData.passwordRepeat) {
      onErrorHook(i18n`passwordsMismatch`);
      return;
    }

    try {
      formData.password = formData.passwordNew;
      await Account.register(formData as IRegisterParams);

      Account.clearLogin();
    } catch (errorMessage) {
      const error =
        errorMessage === Account.messages.loginExists
          ? i18n`loginExists`
          : i18n`failed register`;

      onErrorHook(error);
      return;
    }

    try {
      await Account.getUserData(null, true);
      this.props.history.push('/');
    } catch (error) {
      this.changeStage(Stages.login);
    }
  }

  async sendPassword(formData: TRegisterParams, onSuccessHook: () => void) {
    if (formData.passwordRepeat !== formData.passwordNew) {
      this.setState({ error: i18n`passwordsMismatch` });
      onSuccessHook();
      return;
    }

    formData.username = this.login;
    formData.password = formData.passwordNew;

    try {
      await Account.recovery(formData);
      await Account.authenticate(formData);

      this.props.history.push('/');
    } catch (errorMessage) {
      this.setState({ error: i18n`failed change password` });
      onSuccessHook();
    }
  }

  onFormSubmit: TFormSubmit = (formData, formSuccessHook, formErrorHook) => {
    const { stage } = this.state;
    const handlers: TFormHandlers = {
      [Stages.login]: this.sendLogin,
      [Stages.register]: this.sendRegister,
      [Stages.passwordNew]: this.sendPassword,
    };
    const handler = handlers[stage];

    handler.call(this, formData, formSuccessHook, formErrorHook);
  }

  get formData() {
    const stagesData: any = {
      [Stages.login]: {
        sendText: i18n`signin`,
        fields: {
          username: <InputName label={i18n`login`} pattern='' required />,
          password: <InputPassword autocomplete='on' />,
        },
        buttons: [
          <div className='login__google' id='googleButton' />,
          <Button
            text={i18n`forgot password?`}
            type='main'
            shadow
            onClick={() => this.changeStage(Stages.recovery)}
          />,
        ],
      },
      [Stages.register]: {
        sendText: i18n`signup`,
        fields: {
          username: <InputName label={i18n`login`} pattern='' required />,
          nameFirst: <InputName />,
          nameLast: <InputName label={i18n`surname`} />,
          email: <InputEmail />,
          passwordNew: <InputPassword />,
          passwordRepeat: <InputPassword label={i18n`confirm password`} />,
        },
        needAgreement: true,
      },
      [Stages.recovery]: {
        sendText: i18n`get password`,
        fields: {
          email: <InputEmail />,
        },
        content: this.getLinkToStage(Stages.login),
      },
      [Stages.passwordNew]: {
        sendText: i18n`signin`,
        fields: {
          passwordNew: <InputPassword label={i18n`new password`} />,
          passwordRepeat: <InputPassword label={i18n`confirm password`} />,
        },
        needAgreement: true,
      },
    };

    return stagesData[this.state.stage];
  }

  componentDidUpdate() {
    if (this.state.stage === Stages.login) {
      ReactDOM.render(
        <GoogleLogin
          clientId={social.google.clientId}
          responseType='code'
          render={renderProps => (
            <Button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              icon={<Icons.google />}
            />
          )}
          onSuccess={this.sendGoogleAuth}
          onFailure={error => this.setState({ error })}
          cookiePolicy='single_host_origin'
        />,
        document.getElementById('googleButton'),
      );
    }
  }

  render() {
    const { formData } = this;
    const { error, stage } = this.state;

    return formData ? (
      <Content autosize centerContent fill>
        <Form
          {...formData}
          title={this.getStageTitle(stage)}
          className='login'
          onSubmit={this.onFormSubmit}
          error={error}
        />
      </Content>
    ) : (
      <NotFound />
    );
  }
}

export default withRouter(LoginComponent);
