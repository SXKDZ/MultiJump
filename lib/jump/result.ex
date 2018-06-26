defmodule Jump.Result do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Poison.Encoder, except: [:__meta__]}
  schema "results" do
    field :name, :string
    field :room_key, :string
    field :score, :integer

    timestamps()
  end

  @doc false
  def changeset(result, attrs) do
    result
    |> cast(attrs, [:name, :room_key, :score])
    |> validate_required([:name, :room_key, :score])
  end
end
