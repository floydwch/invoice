module Types
  class MutationType < Types::BaseObject
    # TODO: remove me
    field :test_field, String, null: false,
      description: "An example field added by the generator"
    def test_field
      "Hello World"
    end

    field :updateAdjustments, mutation: Mutations::UpdateAdjustments
    field :review, mutation: Mutations::Review
    field :export, mutation: Mutations::Export
  end
end
