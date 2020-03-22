import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { observer } from 'mobx-react';
import cn from 'classnames';

import { Container } from '../Grid';
import Button from '../Button';
import Icons from '../icons';
import Link from '../Link';
import Navigation from '../Navigation';
import Switcher from '../Switcher';

import { pagesPath } from 'pages/index';
import Account from 'models/account';
import { isClient } from 'js/helpers';
import i18n, { getLang, getLangs, nextLang, setLang } from 'js/i18n';

type THeaderState = {
  isMenuOpen: boolean;
  isScrolled: boolean;
  theme: string;
};

const SCROLL_THRESHOLD = 15;

@observer
class Header extends React.Component<RouteComponentProps, THeaderState> {
  state = {
    isMenuOpen: false,
    isScrolled: false,
    theme: isClient && localStorage.getItem('theme'),
  };

  onChangeLang = () => nextLang();
  onSwitchLang = (index: number) => setLang(getLangs()[index]);

  onChangeTheme = () => {
    const { theme } = this.state;
    const newTheme = theme ? '' : 'dark';
    const themeClass = `theme-${theme}`;

    localStorage.setItem('theme', newTheme);
    document.body.classList.remove(themeClass);
    this.setState({ theme: newTheme });
  }

  toggleMenu = () => this.setState({ isMenuOpen: !this.state.isMenuOpen });

  onScroll = () =>
    window.scrollY > SCROLL_THRESHOLD !== this.state.isScrolled &&
    this.setState({ isScrolled: !this.state.isScrolled })

  componentDidMount() {
    document.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.onScroll);
  }

  componentDidUpdate(prevProps: Readonly<RouteComponentProps>) {
    if (prevProps.location !== this.props.location) {
      this.setState({ isMenuOpen: false });
    }
  }

  render() {
    const { location } = this.props;
    const { isMenuOpen, isScrolled, theme } = this.state;
    const account = Account.getData().value;
    const themeClass = `theme-${theme}`;

    if (isClient) {
      const body = document.body;

      if (!body.classList.contains(themeClass)) {
        body.classList.add(themeClass);
      }
    }

    return (
      <header
        className={cn('header', {
          'header--menu-open': isMenuOpen,
          'header--scroll': isScrolled,
        })}
      >
        <Container>
          <div className='header__content'>
            <Link to='/' className='header__logo'>
              <img src='/img/images/logo.png' alt='Teammaker' />
            </Link>

            <div className='header__links'>
              <Button
                className='header__lang'
                onClick={this.onChangeLang}
                text={getLang()}
                autosize
              />
              <Button
                className='header__theme'
                onClick={this.onChangeTheme}
                icon={theme ? <Icons.moon /> : <Icons.sun />}
                type='icon-main'
                shadow
              />
              <Button
                className='header__profile'
                href={account ? pagesPath.profile : pagesPath.login}
                icon={account ? <Icons.profile /> : <Icons.enter />}
                type='icon-main'
                shadow
              />
              <Button
                className='header__burger'
                onClick={this.toggleMenu}
                icon={<></>}
                shadow
              />
            </div>

            <div className='header__menu'>
              <Button
                className='header__menu-close'
                onClick={this.toggleMenu}
                shape='circle'
              />
              <Switcher
                className='header__menu-langs'
                items={getLangs()}
                activeIndex={getLangs().indexOf(getLang())}
                onSwitch={this.onSwitchLang}
                theme='compact'
              />
              <Navigation signedIn={!!account} />
            </div>
          </div>
        </Container>
      </header>
    );
  }
}

export default withRouter(Header);
