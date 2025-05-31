import { Component } from 'react'

class ErrorCatcher extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  // this lifecycle method is called when an error is thrown in a descendant component
  static getDerivedStateFromError(error) {
    // update state so the next render will show the fallback UI
    return { hasError: true }
  }

  // this lifecycle method is called after an error is thrown in a descendant component
  componentDidCatch(error, errorInfo) {
    this.props?.onError(error, errorInfo)
  }

  // detect when error state changes
  componentDidUpdate(prevProps, prevState) {
    if (prevState.hasError && !this.state.hasError) {
      this.props?.onError(null, null)
    }
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

export { ErrorCatcher }
