package example

import japgolly.scalajs.react._, vdom.all._
import scala.scalajs.js
import org.scalajs.dom
import dom.ext.Ajax
import scala.concurrent.ExecutionContext.Implicits.global

object TimerExample {

  def content = Timer()

  case class Content(id: String, imgsrc: String, title: String, description: String) {
    def link: String = "http://nico.ms/" + id
  }

  val container = ReactComponentB[(Content)]("picture")
    .render(p => {
    div(cls := "item",
      div(cls := "ui divider"),
      div(cls := "image",
        img(cls := "ui left small rounded image", src := p.imgsrc, title := p.title)
      ),
      div(cls := "content",
        h2(cls := "teal header", a(
          href := p.link, p.title
        )
        ),
        // taglist
        div(cls := "description", p.description)
      )
    )
  })
    .build

  val contentsList = ReactComponentB[(List[Content])]("contentsList")
    .render(list => {
    div(cls := "ui items")(
      list.map(p => container.withKey(p.id)(p))
    )
  })
    .build

  case class State(contents: List[Content])


  class Backend($: BackendScope[_, State]) {
    var interval: js.UndefOr[js.timers.SetIntervalHandle] =
      js.undefined

    def tick() = {
      $.modState(s => s)
    }

    def getJson = {

      val url = "http://api.search.nicovideo.jp/api/"
      val data =
        """
          |{
          |      query: "test",
          |      service: ['video'],
          |      search: ['title','description','tags'],
          |      join: ['cmsid','title','description','tags', 'thumbnail_url', 'view_counter', 'mylist_counter', 'start_time'],
          |      sort_by: '_popular',
          |      order: true,
          |      size:15,
          |      issuer: "github.com/iwag",
          |      reason: "react js"
          |    }
        """.stripMargin

      Ajax.post(url, data).foreach {
        x =>
          val rows = x.responseText.split("\r\n").toList
          val valuesString = rows.find(p => p.contains( """"type":"hits","values"""")).get
          val obj = valuesString.asInstanceOf[js.Dynamic]
          // val contents = read[List[Content]](valuesString)
          //$.modState(_ => State(contents))
          dom.console.info(obj)
      }
      /*
      g.jsonp(url, (result: js.Dynamic) => {
        if (result != js.undefined && result.data != js.undefined) {
          dom.console.info(result)
          dom.console.info(result.data)
          val data = result.data.asInstanceOf[js.Array[js.Dynamic]]
          val pics = data.toList.map(item => Content(item.cmsid.toString, item.thumbnail_url.toString, item.title.toString, item.description.toString))
          $.modState(_ => State(pics))
        }
      })
      */
    }

    def start() = {
      interval = js.timers.setInterval(1000)(tick())
      getJson
    }
  }

  def initialState(): State = {
    State(
      List(Content("sm9", "http://tn-skr2.smilevideo.jp/smile?i=9", "sm9", "sm9 sm9"),
        Content("sm22954889", "http://tn-skr2.smilevideo.jp/smile?i=22954889", "test", "test test"))
    )
  }


  val Timer = ReactComponentB[Unit]("Timer")
    .initialState(initialState())
    .backend(new Backend(_))
    .render(props => {
    div(cls := "ui page grid",
      div(cls := "column",
        div(cls := "ui large aligned header",
          "test"
        ),
        div(cls := "ui divider"),
        contentsList(props.state.contents)
      )
    )
  })
    .componentDidMount(_.backend.start())
    .componentWillUnmount(_.backend.interval foreach js.timers.clearInterval)
    .buildU
}
