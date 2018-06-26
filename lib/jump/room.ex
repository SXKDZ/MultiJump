defmodule Jump.Room do
  use Ecto.Schema
  import Ecto.Changeset


  schema "rooms" do
    field :key, :string
    field :seed, :integer
    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:key, :seed])
    |> validate_required([:key, :seed])
  end
end
