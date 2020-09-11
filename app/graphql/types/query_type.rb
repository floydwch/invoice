module Types
  class QueryType < Types::BaseObject
    # Add root-level fields here.
    # They will be entry points for queries on your schema.

    # TODO: remove me
    field :test_field, String, null: false,
      description: "An example field added by the generator"
    def test_field
      "Hello World!"
    end

    field :lineItems, LineItemType.connection_type, null: false, description: 'All line-items' do
      argument :orderBy, String, required: false
      argument :direction, String, required: false
    end
    def lineItems(orderBy:, direction:)
      if (LineItem.column_names.include? orderBy) && (['ASC', 'DESC'].include? direction)
        LineItem.includes(:campaign).order("#{orderBy} #{direction}")
      else
        LineItem.all.includes(:campaign)
      end
    end
  end
end
