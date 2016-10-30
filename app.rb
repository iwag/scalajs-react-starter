require 'sinatra'

require 'net/http'
require 'uri'

get '/' do
    headers \
      "Vary" => "*"
    send_file File.join(settings.public_folder, 'index.html')
end

get '/*/' do |path|
    headers \
      "Vary" => "*"
    send_file File.join(settings.public_folder, path, 'index.html')
end

get '/*/*/' do |path|
    send_file File.join(settings.public_folder, path, 'index.html')
end

get '/*/*/*/' do |path|
    send_file File.join(settings.public_folder, path, 'index.html')
end

get '/:name/search' do |n|
   p = params.map{|k,j| 
     v = j.is_a?(Array) ? j.join("").to_s : j.to_s
     k + "=" + v
   }.join("&")

   url = URI.parse('http://api.search.nicovideo.jp')
   res = Net::HTTP.start(url.host, url.port) {|http|
     path = URI.escape('/api/v2/' + n + '/contents/search?' + p)
    http.get(path)
   }

   headers \
     "Vary" => "*",
     "Access-Control-Allow-Origin" => "*"
   res.body
end
