module Types
  class OrderByType < GraphQL::Schema::InputObject
    argument :field, String, required: true
    argument :direction, String, required: true
  end
end