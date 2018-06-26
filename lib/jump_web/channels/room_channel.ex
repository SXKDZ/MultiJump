defmodule JumpWeb.RoomChannel do
  use JumpWeb, :channel
  import Ecto.Query

  def join("room:lobby", payload, socket) do
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("start", payload, socket) do
    %{"room" => room, "name" => name} = payload

    query = from r in Jump.Room, where: r.key == ^room, select: r.seed
    seed = Jump.Repo.one(query)

    if !seed do
      seed = :rand.uniform(100000)
      params = %{seed: seed, key: room}
      Jump.Room.changeset(%Jump.Room{}, params) |> Jump.Repo.insert
    end
    payload = Map.put(payload, :seed, seed)

    broadcast socket, "start", payload
    {:noreply, socket}
  end
  
  def handle_in("terminate", payload, socket) do
    %{"room" => room, "name" => name} = payload

    query = from r in Jump.Room, where: r.key == ^room
    Jump.Repo.delete_all(query)

    broadcast socket, "terminate", payload
    {:noreply, socket}
  end

  def handle_in("jump", payload, socket) do
    broadcast socket, "jump", payload
    {:noreply, socket}
  end

  def handle_in("no-jump", payload, socket) do
    %{"room" => room_key, "name" => name, "score" => score} = payload

    params = %{room_key: room_key, name: name, score: score}
    Jump.Result.changeset(%Jump.Result{}, params) |> Jump.Repo.insert

    broadcast socket, "no-jump", payload
    {:noreply, socket}
  end

  defp authorized?(_payload) do
    true
  end
end
