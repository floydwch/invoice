module Types
  class SearchType < GraphQL::Schema::InputObject
    argument :field, String, required: true
    argument :value, String, required: true
  end
end