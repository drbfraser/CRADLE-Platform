import React from 'react'
import { push } from 'connected-react-router'
import { Button } from 'semantic-ui-react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, Header,  Image, Modal } from 'semantic-ui-react'
import {
  increment,
  incrementAsync,
  decrement,
  decrementAsync
} from '../../actions/counter'

import {
  getPosts
} from '../../actions/posts'

const Home = props => (
  <div className="content">
    <h1>Home</h1>
    <Modal trigger={<Button>Show Modal</Button>}>
    <Modal.Header>Select a Photo</Modal.Header>
      <Modal.Content image>
        <Image wrapped size='medium' src='/images/avatar/large/rachel.png' />
        <Modal.Description>
          <Header>Default Profile Image</Header>
          <p>
            We've found the following gravatar image associated with your e-mail
            address.
          </p>
          <p>Is it okay to use this photo?</p>
        </Modal.Description>
      </Modal.Content>
    </Modal>
    <Button content='Primary' primary />
    <Button content='Secondary' secondary />
    <div class="ui divider"></div>
    <Header as='h1'>First Header</Header>
    <Header as='h2'>Second Header</Header>
    <Header as='h3'>Third Header</Header>
    <Header as='h4'>Fourth Header</Header>
    <Header as='h5'>Fifth Header</Header>
    <Header as='h6'>Sixth Header</Header>

    <p>Count: {props.count}</p>

    <p>Message from server: {props.msg}</p>

    <p>
      <Button onClick={props.increment}>Increment</Button>
      <Button onClick={props.incrementAsync} disabled={props.isIncrementing}>
        Increment Async
      </Button>
    </p>

    <p>
      <button onClick={props.decrement}>Decrement</button>
      <button onClick={props.decrementAsync} disabled={props.isDecrementing}>
        Decrement Async
      </button>
    </p>

    <p>
      <button onClick={() => props.changePage()}>
        Go to about page via redux
      </button>
    </p>

    <p>
      <button onClick={() => props.getPosts()}>
        Click me to get posts from server.
      </button>
    </p>

    <p>
      <ul>
        {props.posts.map((post, i) => {
          return <li key={i}>{post.title}</li>
        })}
      </ul>
    </p>

  </div>
)

const mapStateToProps = ({ counter, posts }) => ({
  count: counter.count,
  isIncrementing: counter.isIncrementing,
  isDecrementing: counter.isDecrementing,
  posts: posts.posts,
  msg: posts.msg
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      increment,
      incrementAsync,
      decrement,
      decrementAsync,
      changePage: () => push('/about-us'),
      getPosts
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
