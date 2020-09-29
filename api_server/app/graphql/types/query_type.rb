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
      argument :search, Types::SearchType, required: false
    end
    def lineItems(orderBy: nil, direction: nil, search: nil)
      if search
        case search.field
        when 'line_item'
          records = LineItem.search(size: LineItem.count, query: {match: {'name' => {query: search.value, operator: 'and'}}}).records
        when 'campaign'
          records = LineItem.search(size: LineItem.count, query: {match: {'campaign.name' => {query: search.value, operator: 'and'}}}).records
        else
          records = LineItem
        end
      else
        records = LineItem
      end
      if (['name', 'booked_amount', 'actual_amount', 'adjustments', 'campaigns.name'].include? orderBy) && (['ASC', 'DESC'].include? direction)
        return records.includes(:campaign).order("#{orderBy} #{direction}, line_items.id ASC")
      else
        return records.includes(:campaign)
      end
    end

    field :exportation, ExportationType, null: false, description: 'Get exportation by token' do
      argument :token, String, required: true
    end
    def exportation(token:)
      exportation = Exportation.find_by(token: token)
      result = exportation.as_json
      result[:url] = Rails.application.routes.url_helpers.rails_blob_path(exportation.file, only_path: true)
      return result
    end
  end
end
