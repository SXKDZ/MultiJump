defmodule JumpWeb.PageController do
  use JumpWeb, :controller
  import Ecto.Query

  def index(conn, _params) do
    render conn, "index.html"
  end

  def scoreboard(conn, %{"room" => room} = params) do
    query = from r in Jump.Result, where: r.room_key == ^room
    json conn, Jump.Repo.all(query)
  end
end
