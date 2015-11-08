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

  case class Content(service: String, id: String, imgsrc: String, tags: String, title: String, description: String, startTime: String) {
    def link: String = "http://nico.ms/" + id
    def serviceName: String = service match {
      case "live" => "生放送"
      case "video" =>  "動画"
      case "illust" => "静画"
      case "news" => "ニュース"
    }
  }

  type Click = (ReactEventI) => Unit

  val inputForm = ReactComponentB[(String, Click, Click)]("input").render { p =>
      val (text, change, click) = p
      div(cls := "ui icon input",
        form( onSubmit ==> click,
          i(cls := "circular search icon"),
        input(`type` := "text", onChange ==> change, placeholder := "...", value := text),
        button("do")
        )
      )
  }.build

  val container = ReactComponentB[(Content)]("picture")
    .render(p => {
    div(cls := "item",
      div(cls := "image",
        img(cls := "ui left small rounded image", src := p.imgsrc, title := p.title)
      ),
      div(cls := "content",
        h2(cls := "teal header", a(
          href := p.link, dangerouslySetInnerHtml(p.title)
        )
        ),
        div(cls:="meta", p.serviceName + " " + p.tags + " " + p.startTime),
        // taglist
        div(cls := "description", dangerouslySetInnerHtml(p.description)),
        div(cls := "extra")
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

  case class State(contents: List[Content], text:String = "")

  val initial = List()

  class Backend($: BackendScope[_, State]) {


    var interval: js.UndefOr[js.timers.SetIntervalHandle] =
      js.undefined

    val intervalSec = 60

    val delayMin = 5

    def doGetJson() = {


      val d = new js.Date

      def pad(i:Int):String = i.formatted("%02d")

      val url = "http://api.search.nicovideo.jp/api/"

      val startSec = (d.getSeconds()-intervalSec+60) % 60

      def data(s: String, joins: String, sort:String) =
        s"""
          |{
          |      query: "、 or 。 or は or が or の",
          |      service: ['${s}'],
          |      search: ['title','description','tags'],
          |      join: [${joins}],
          |      sort_by: '${sort}',
          |      order: "desc",
          |      filters: [
          |      {"type":"range", "field":"start_time",
          |      "to":"${d.getFullYear}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours)}:${pad(d.getMinutes)}:${pad(d.getSeconds())}",
          |      "from":"${d.getFullYear}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours)}:${pad(d.getMinutes-delayMin)}:${pad(startSec)}"
          |      },
          |      {"type":"range", "field":"community_level", "from":20},
          |      {"type":"equal", "field":"ss_adult", "value":false}
          |      ],
          |      size:10,
          |      issuer: "github.com/iwag",
          |      reason: "react js"
          |    }
        """.stripMargin


      val services = List(
        ("video", List("cmsid", "title", "description", "tags", "thumbnail_url", "view_counter", "category_tags", "start_time"), "start_time"),
        ("news", List("cmsid", "title", "description", "tags", "start_time"), "last_comment_time"),
        ("illust", List("cmsid", "title", "description", "tags", "thumbnail_url", "view_counter", "start_time"), "start_time"),
        //        "book" -> List("cmsid","title","description","tags", "thumbnail_url", "view_counter", "start_time"),
        ("live", List("cmsid", "title", "description", "tags", "community_icon", "thumbnail_url", "view_counter", "category_tags", "start_time", "community_level"), "start_time")
      ).map{i => (i._1,  i._2.map(s=>s""" "${s}" """).mkString(","), i._3)}

      dom.console.log(data(services.head._1, services.head._2, services.head._3))

      services.foreach { ii =>
        val (s, joins, sort) = ii

        Ajax.post(url, data(s,joins,sort)).foreach {
          x =>
            val rows = x.responseText.split("\n").toList

            rows.find(p => p.contains( """"total":""")) match {
              case Some(v) => dom.console.log(v); ""
              case None => ""
            }
            // dom.console.log(x.responseText)
            rows.find(p => p.contains( """"type":"hits","values"""")) match {
              case Some(valuesRowString) =>
                val values = js.JSON.parse(valuesRowString).values.asInstanceOf[js.Array[js.Dynamic]]

                val list = values.map { v =>
                  val thumb = if (s=="live" && v.community_icon != null) v.community_icon.toString else v.thumbnail_url.toString
                  Content(s, v.cmsid.toString, thumb, v.tags.toString, v.title.toString, v.description.toString, v.start_time.toString)
                } toList


                $.modState { st =>
                  val sorted = (list ++ st.contents)
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

    def changeText(e:ReactEventI):Unit = {
      $.modState(s=>
        State(s.contents, e.target.value)
      )
    }

    def onClick(e:ReactEventI):Unit ={
      doGetJson
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
        div(cls := "ui large aligned header"),
        inputForm((props.state.text, props.backend.changeText, props.backend.onClick)),
        div(cls := "ui divider"),
        contentsList(props.state.contents)
      )
    )
  })
    .componentDidMount(_.backend.start())
    .componentWillUnmount(_.backend.interval foreach js.timers.clearInterval)
    .buildU
}
