package example

import japgolly.scalajs.react._, vdom.all._
import scala.scalajs.js

object TimerExample {

  def content = Timer()

  case class State()

  class Backend($: BackendScope[_, State]) {
    var interval: js.UndefOr[js.timers.SetIntervalHandle] =
      js.undefined

    def tick() = {
      $.modState(s => s)
    }

    def start() =
      interval = js.timers.setInterval(1000)(tick())
  }

  def initialState(): State = {
    State()
  }

  val Timer = ReactComponentB[Unit]("Timer")
    .initialState(initialState())
    .backend(new Backend(_))
    .render(props => {
    div(cls := "ui segment",
      div(cls := "ui large right aligned header",
        "test"
      )
        (div(cls := "ui divider", "test"))
    )
  })
    .componentDidMount(_.backend.start())
    .componentWillUnmount(_.backend.interval foreach js.timers.clearInterval)
    .buildU
}
