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

    val services = List(
      ("video", List("contentId", "title", "description", "tags", "thumbnailUrl", "viewCounter", "categoryTags", "startTime"), "startTime"),
      ("news", List("contentId", "title", "description", "tags", "startTime"), "lastCommentTime"),
      ("illust", List("contentId", "title", "description", "tags", "thumbnailUrl", "viewCounter", "startTime"), "startTime"),
      //        "book" -> List("contentId","title","description","tags", "thumbnail_url", "view_counter", "start_time"),
      ("live", List("contentId", "title", "description", "tags", "communityIcon", "thumbnailUrl", "viewCounter", "categoryTags", "start_time", "community_level"), "startTime")
    ).map{i => (i._1,  i._2, i._3)}

    def doGetJsonV2() = {
      val d = new js.Date

      def pad(i: Int): String = i.formatted("%02d")

      val urlBase = "http://localhost:4567"

      val startSec = (d.getSeconds() - intervalSec + 60) % 60

      def params(j: List[String], sort: String) = Map[String, String](
        "q" -> "%E3%80%81%20or%20%E3%80%82%20or%20%E3%81%AF%20or%20%E3%81%8C%20or%20%E3%81%AE",
        "targets" -> "title,description,tags",
        "fields" -> j.mkString(","),
        "_sort" -> ("-" + sort),
//        "filters[startTime][gte]" ->
//          s"${d.getFullYear}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours)}:${pad(d.getMinutes)}:${pad(d.getSeconds())}%2b09:00",
//        "filters[startTime][lt]" ->
//          s"${d.getFullYear}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours)}:${pad(d.getMinutes - delayMin)}:${pad(startSec)}%2b09:00",
//        "filters[ssAdult][0]" -> "false",
        "_limit" -> "10",
        "_offset" -> "0",
        "_context" -> "github.com/iwag"
      ).map(i => i._1 + "=" + i._2).mkString("&")

      def url(s: String): String = List(urlBase, s, "search").mkString("/")

      services.foreach { ii =>
        val (s, joins, sort) = ii

        Ajax.get(url(s) + "?" + params(joins, sort)).foreach {
          x =>
            val values = js.JSON.parse(x.responseText).data.asInstanceOf[js.Array[js.Dynamic]]

            val list = values.map { v =>
              val thumb = if (s == "live" && v.communityIcon != null) v.communityIcon.toString else v.thumbnailUrl.toString
              Content(s, v.contentId.toString, thumb, v.tags.toString, v.title.toString, v.description.toString, v.startTime.toString)
            } toList


            $.modState { st =>
              val sorted = (list ++ st.contents)
              State(sorted)
            }

            list
        }
      }
    }

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

      //dom.console.log(data(services.head._1, services.head._2, services.head._3))

      services.foreach { ii =>
        val (s, j, sort) = ii
        val joins = j.map(s=>s""" "${s}" """).mkString(",")

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
      doGetJsonV2()
    }

    def start() = {
      interval = js.timers.setInterval(intervalSec*1000)(tick())
      doGetJsonV2()
    }

    def changeText(e:ReactEventI):Unit = {
      $.modState(s=>
        State(s.contents, e.target.value)
      )
    }

    def onClick(e:ReactEventI):Unit ={
      doGetJsonV2
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
