import * as React from 'react';
import Toggle from '../Toggle';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import Term, { ITerm } from '../../models/term';
import Loading from '../Loading';
import { ModelStatus } from '../../models';
import { getElementOffsetTop } from '../../helpers';

interface ITermsState {
  openedTerm?: number;
}

type TTermsProps = RouteComponentProps & {
  openedTerm?: number;
};

@observer
class Terms extends React.Component<TTermsProps, ITermsState> {
  state = {
    openedTerm: this.props.openedTerm,
  };
  containerRef = React.createRef<HTMLDivElement>();
  links: NodeListOf<HTMLAnchorElement> = null;

  getItems = () => Term.all();

  static getDerivedStateFromProps(props: TTermsProps, state: ITermsState) {
    const { hash } = props.location;

    if (hash.includes('-')) {
      const openedTerm = Number(hash.slice(1).split('-')[0]) - 1;

      return { openedTerm };
    }

    return state;
  }

  handleContentLinks() {
    if (!this.containerRef.current || this.links) {
      return;
    }

    this.links = this.containerRef.current.querySelectorAll('a');
    const links = Array.from(this.links);
    const currentPage = this.props.location.pathname;

    links.forEach((link: HTMLAnchorElement) =>
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const isSamePage = currentPage === link.pathname;

        this.props.history.push(`${isSamePage ? '' : link.pathname}${link.hash}`);
      }),
    );
  }

  componentDidMount() {
    const { hash } = this.props.location;
    const openedTerm = Number(hash.slice(1)) - 1;

    this.setState({ openedTerm });
    this.handleContentLinks();
  }

  componentDidUpdate() {
    this.handleContentLinks();

    const { hash } = this.props.location;
    const elementToScroll = hash.slice(1);

    setTimeout(() => {
      const targetElement = document.getElementById(elementToScroll);

      if (!targetElement) {
        return;
      }

      const offset = getElementOffsetTop(targetElement);

      window.scrollTo({ top: offset - 110, behavior: 'smooth' });
    }, 500);
  }

  handleClick = (index: number) => {
    const { history, location } = this.props;

    history.push(location.pathname);
    this.setState({
      openedTerm: this.state.openedTerm === index ? null : index,
    });
  }

  renderContentList = (items: ITerm[]) => (
    <>
      <p className='page__toc'>Содержание</p>
      <ol className='page__list'>
        {items.map((item: ITerm, index: number) => item.title && (
          <li className='page__list-item' key={index}>
            <a className='page__link' href={`#${index + 1}-toc`}>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </>
  )

  render() {
    const itemsData = this.getItems();
    const items = itemsData.value;

    if (!items) {
      return itemsData.status === ModelStatus.fetching && <Loading />;
    }

    return (
      <div className='terms' ref={this.containerRef}>
        {this.renderContentList(items)}
        {items.map((term: ITerm, index: number) => {
          const opened = index === this.state.openedTerm;
          const { title, body } = term;

          return title && body && (
            <Toggle
              id={`${index + 1}-toc`}
              key={title || index}
              type={'big'}
              title={title}
              isOpen={opened}
              needScroll={true}
              onlyHeadOpen={true}
              onClick={() => this.handleClick(index)}
            >
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </Toggle>
          );
        })}
      </div>
    );
  }
}

export { Terms };
export default withRouter(Terms);
