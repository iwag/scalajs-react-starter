package example

import japgolly.scalajs.react._, vdom.all._
import scala.scalajs.js
import org.scalajs.dom
import dom.ext.Ajax
import scala.concurrent.ExecutionContext.Implicits.global

object TimerExample {

  def content = Timer()

  case class Tag(name: String)

  val tag = ReactComponentB[Tag]("tag")
  .render( _ =>
    div(cls := "ui small basic button")
    ).build

  val tagList = ReactComponentB[List[Tag]]("tags")

  case class Content(id: String, imgsrc: String, tags: String, title: String, description: String, startTime: String) {
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
          href := p.link, dangerouslySetInnerHtml(p.title)
        )
        ),
        div(cls:="meta", p.tags),
        // taglist
        div(cls := "description", dangerouslySetInnerHtml(p.description))
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

  val initial = List()

  class Backend($: BackendScope[_, State]) {


    var interval: js.UndefOr[js.timers.SetIntervalHandle] =
      js.undefined

    val intervalSec = 30

    def doGetJson() = {


      val d = new js.Date

      dom.console.log(d.toLocaleDateString() + d.toLocaleTimeString())

      def pad(i:Int):String = i.formatted("%02d")

      val url = "http://api.search.nicovideo.jp/api/"
      def data(s:String) =
        s"""
          |{
          |      query: "、 or 。 or は or が or の",
          |      service: ['${s}'],
          |      search: ['title','description','tags'],
          |      join: ['cmsid','title','description','tags', 'thumbnail_url', 'view_counter', 'category_tags', 'start_time'],
          |      sort_by: 'start_time',
          |      order: "desc",
          |      filters: [
          |      {"type":"range", "field":"start_time",
          |      "to":"${d.getFullYear}-${pad(8)}-${pad(27)} ${pad(d.getHours)}:${pad(d.getMinutes)}:${pad(d.getSeconds())}",
          |      "from":"${d.getFullYear}-${pad(8)}-${pad(27)} ${pad(d.getHours)}:${pad(d.getMinutes)}:${pad(scala.math.max(d.getSeconds()-intervalSec,0))}"
          |      }
          |      ],
          |      size:10,
          |      issuer: "github.com/iwag",
          |      reason: "react js"
          |    }
        """.stripMargin


      List("video","live", "news").foreach { s =>
        dom.console.log(data(s))
        Ajax.post(url, data(s)).foreach {
          x =>
            //  dom.console.log(x.responseText)
            val rows = x.responseText.split("\n").toList
            rows.find(p => p.contains( """"type":"hits","values"""")) match {
              case Some(valuesRowString) =>
                val values = js.JSON.parse(valuesRowString).values.asInstanceOf[js.Array[js.Dynamic]]

                val list = values.map { v =>
                  Content(v.cmsid.toString, v.thumbnail_url.toString, v.tags.toString, v.title.toString, v.description.toString, v.start_time.toString)
                } toList

                dom.console.log(list.toString)

                $.modState{s =>
                      val sorted = (list ++ s.contents) //.sortBy(c => c.startTime)
                      State(sorted)
                }

                list
              case None => List()
            }
        }
      }

    }

    def tick() = {
      doGetJson()
    }

    def start() = {
      interval = js.timers.setInterval(intervalSec*1000)(tick())
      doGetJson()
    }
  }

  def initialState(): State = {
    State(
      initial
    )
  }


  val Timer = ReactComponentB[Unit]("Timer")
    .initialState(initialState())
    .backend(new Backend(_))
    .render(props => {
    div(cls := "ui page grid",
      div(cls := "column",
        div(cls := "ui large aligned header",
          "タイムラインβ"
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
